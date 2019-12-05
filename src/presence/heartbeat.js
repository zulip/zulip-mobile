// @flow strict-local

/**
 * Heartbeat: Perform callbacks at regular intervals.
 *
 * While active, calls `callback` with `true` every `milliseconds` milliseconds.
 * While inactive, does nothing.
 *
 * When transitioning from active to inactive, performs one additional edge-
 * triggered callback with `true` iff fewer than `milliseconds` milliseconds
 * have elapsed since the previous one.
 *
 * (Despite the generic-looking definition, this class is closely tailored to
 * user-presence reporting.)
 */
// At present, this class never calls `callback` with `false`, despite
// `callback` taking a boolean argument.
class Heartbeat {
  intervalId: IntervalID | null = null;

  callback: (state: boolean) => void;
  milliseconds: number;
  previousTime: number = -Infinity;

  constructor(callback: (state: boolean) => void, milliseconds: number) {
    this.callback = callback;
    this.milliseconds = milliseconds;
  }

  doCallback = (value: boolean) => {
    this.previousTime = Date.now();
    this.callback(value);
  };

  /** PRIVATE. Exposed only for tests. */
  isActive() {
    return this.intervalId !== null;
  }

  /** Start the heartbeat. Idempotent. */
  start() {
    if (this.isActive()) {
      return;
    }
    if (this.previousTime + this.milliseconds <= Date.now()) {
      this.doCallback(true);
    }
    this.intervalId = setInterval(this.doCallback, this.milliseconds, true);
  }

  /** Stop the heartbeat. Idempotent. */
  stop() {
    if (!this.isActive()) {
      return;
    }
    clearInterval(this.intervalId);
    this.intervalId = null;
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
