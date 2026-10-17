import {
  DpCommand,
  GrillButton,
  GrillController,
  GrillState,
  planTransition,
} from '../src/domain/grillController';

const CHANNELS = { up: '1', down: '2' };

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('planTransition', () => {
  const cases: [GrillState, GrillButton, GrillState, DpCommand[]][] = [
    ['stopped', 'up', 'raising', [{ '1': true }]],
    ['stopped', 'down', 'lowering', [{ '2': true }]],
    ['raising', 'up', 'stopped', [{ '1': false }]],
    ['raising', 'down', 'lowering', [{ '1': false }, { '2': true }]],
    ['lowering', 'down', 'stopped', [{ '2': false }]],
    ['lowering', 'up', 'raising', [{ '2': false }, { '1': true }]],
  ];

  it.each(cases)('%s + %s -> %s', (state, button, next, steps) => {
    expect(planTransition(state, button, CHANNELS)).toEqual({ next, steps });
  });
});

describe('GrillController', () => {
  it('applies the new state once the commands are sent', async () => {
    const sent: DpCommand[] = [];
    const controller = new GrillController(async (command) => {
      sent.push(command);
    }, CHANNELS);

    await expect(controller.press('up')).resolves.toEqual({ status: 'ok' });
    expect(controller.getSnapshot()).toEqual({ state: 'raising', busy: false });

    await controller.press('down');
    expect(controller.getSnapshot().state).toBe('lowering');
    expect(sent).toEqual([{ '1': true }, { '1': false }, { '2': true }]);
  });

  it('only sends ON after the OFF of the other channel is confirmed', async () => {
    const off = deferred();
    const sent: DpCommand[] = [];
    const controller = new GrillController(
      (command) => {
        sent.push(command);
        return sent.length === 1 ? off.promise : Promise.resolve();
      },
      CHANNELS,
      'raising'
    );

    const press = controller.press('down');
    await Promise.resolve();
    expect(sent).toEqual([{ '1': false }]);

    off.resolve();
    await press;
    expect(sent).toEqual([{ '1': false }, { '2': true }]);
  });

  it('does not send ON when the OFF fails, and keeps the previous state', async () => {
    const sent: DpCommand[] = [];
    const controller = new GrillController(
      async (command) => {
        sent.push(command);
        throw new Error('offline');
      },
      CHANNELS,
      'raising'
    );

    const result = await controller.press('down');
    expect(result.status).toBe('failed');
    expect(sent).toEqual([{ '1': false }]);
    expect(controller.getSnapshot()).toEqual({ state: 'raising', busy: false });
  });

  it('ends stopped when the OFF worked but the ON failed', async () => {
    let calls = 0;
    const controller = new GrillController(
      async () => {
        calls += 1;
        if (calls === 2) throw new Error('offline');
      },
      CHANNELS,
      'lowering'
    );

    const result = await controller.press('up');
    expect(result.status).toBe('failed');
    expect(controller.getSnapshot().state).toBe('stopped');
  });

  it('keeps the previous state when a single command fails', async () => {
    const controller = new GrillController(async () => {
      throw new Error('offline');
    }, CHANNELS);

    await controller.press('up');
    expect(controller.getSnapshot()).toEqual({ state: 'stopped', busy: false });
  });

  it('ignores presses while a previous one is in flight', async () => {
    const pending = deferred();
    const sent: DpCommand[] = [];
    const controller = new GrillController((command) => {
      sent.push(command);
      return pending.promise;
    }, CHANNELS);

    const first = controller.press('up');
    expect(controller.getSnapshot().busy).toBe(true);
    await expect(controller.press('down')).resolves.toEqual({ status: 'ignored' });

    pending.resolve();
    await first;
    expect(sent).toEqual([{ '1': true }]);
    expect(controller.getSnapshot()).toEqual({ state: 'raising', busy: false });
  });

  it('notifies subscribers on every change', async () => {
    const controller = new GrillController(async () => {}, CHANNELS);
    const listener = jest.fn();
    const unsubscribe = controller.subscribe(listener);

    await controller.press('up');
    expect(listener).toHaveBeenCalledTimes(2); // busy, then done

    unsubscribe();
    await controller.press('up');
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
