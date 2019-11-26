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
  _callback: (state: boolean) => void;
  _milliseconds: number;
  _intervalId: IntervalID | null = null;

  constructor(callback: (state: boolean) => void, milliseconds: number) {
    this._callback = callback;
    this._milliseconds = milliseconds;
  }

  /** PRIVATE. Exposed only for tests. */
  isActive() {
    return this._intervalId !== null;
  }

  /** Start the heartbeat. Idempotent. */
  start() {
    if (this.isActive()) {
      return;
    }
    this._callback(true);
    this._intervalId = setInterval(this._callback, this._milliseconds, true);
  }

  /** Stop the heartbeat. Idempotent. */
  stop() {
    if (!this.isActive()) {
      return;
    }
    clearInterval(this._intervalId);
    this._intervalId = null;
    this._callback(false);
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
