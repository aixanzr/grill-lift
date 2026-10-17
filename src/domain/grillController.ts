export type GrillState = 'stopped' | 'raising' | 'lowering';
export type GrillButton = 'up' | 'down';
export type DpCommand = Record<string, boolean>;
export type ChannelMap = { up: string; down: string };

/** Sends one command to the device. Resolves when the SDK confirms it was sent. */
export type SendCommand = (command: DpCommand) => Promise<void>;

export type GrillSnapshot = { state: GrillState; busy: boolean };

export type PressResult =
  { status: 'ok' } | { status: 'ignored' } | { status: 'failed'; error: unknown };

type Transition = { next: GrillState; steps: DpCommand[] };

/**
 * Commands for each button press (PLAN.md §4.1). When the direction changes, the running
 * channel is switched off first and the other one is only switched on after that succeeds.
 */
export function planTransition(
  state: GrillState,
  button: GrillButton,
  channels: ChannelMap
): Transition {
  const pressed = channels[button];
  const other = channels[button === 'up' ? 'down' : 'up'];
  const target: GrillState = button === 'up' ? 'raising' : 'lowering';

  if (state === 'stopped') {
    return { next: target, steps: [{ [pressed]: true }] };
  }
  if (state === target) {
    return { next: 'stopped', steps: [{ [pressed]: false }] };
  }
  return { next: target, steps: [{ [other]: false }, { [pressed]: true }] };
}

export class GrillController {
  private snapshot: GrillSnapshot;
  private listeners = new Set<() => void>();

  constructor(
    private readonly send: SendCommand,
    private readonly channels: ChannelMap,
    initialState: GrillState = 'stopped'
  ) {
    this.snapshot = { state: initialState, busy: false };
  }

  getSnapshot = (): GrillSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Presses are ignored while a previous one is still being sent, so two transitions can
   * never interleave (which could leave both channels on).
   */
  async press(button: GrillButton): Promise<PressResult> {
    if (this.snapshot.busy) {
      return { status: 'ignored' };
    }
    const { next, steps } = planTransition(this.snapshot.state, button, this.channels);
    let reached = this.snapshot.state;
    this.update({ busy: true });

    try {
      for (const step of steps) {
        await this.send(step);
        // After the first step of a direction change the motor is already stopped.
        if (steps.length > 1) {
          reached = 'stopped';
        }
      }
      this.update({ state: next, busy: false });
      return { status: 'ok' };
    } catch (error) {
      this.update({ state: reached, busy: false });
      return { status: 'failed', error };
    }
  }

  private update(change: Partial<GrillSnapshot>) {
    this.snapshot = { ...this.snapshot, ...change };
    this.listeners.forEach((listener) => listener());
  }
}
