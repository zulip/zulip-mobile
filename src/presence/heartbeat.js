// @flow strict-local

/**
 * Heartbeat: Perform callbacks at regular intervals.
 *
 * While active, calls `callback` with `true` every `milliseconds` milliseconds.
 * While inactive, does nothing.
 *
 * When transitioning between active and inactive states, performs one
 * additional edge-triggered callback with `true` (if starting) or `false` (if
 * stopping).
 *
 * (Despite the generic-looking definition, this class is closely tailored to
 * user-presence reporting.)
 */
class Heartbeat {
  intervalId: IntervalID | null = null;

  callback: (state: boolean) => void;
  milliseconds: number;

  constructor(callback: (state: boolean) => void, milliseconds: number) {
    this.callback = callback;
    this.milliseconds = milliseconds;
  }

  /** PRIVATE. Exposed only for tests. */
  isActive() {
    return this.intervalId !== null;
  }

  /** Start the heartbeat. Idempotent. */
  start() {
    if (this.isActive()) {
      return;
    }
    this.callback(true);
    this.intervalId = setInterval(this.callback, this.milliseconds, true);
  }

  /** Stop the heartbeat. Idempotent. */
  stop() {
    if (!this.isActive()) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.callback(false);
  }

  /** Set the current heartbeat state. Idempotent. */
  toState(active: boolean) {
    if (active) {
      this.start();
    } else {
      this.stop();
    }
  }
}

export default Heartbeat;
