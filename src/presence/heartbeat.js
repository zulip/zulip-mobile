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
  _callback: (state: boolean) => void;
  _milliseconds: number;

  _active: boolean = false;
  _intervalId: IntervalID | null = null;
  _previousTime: number = -Infinity;

  constructor(callback: (state: boolean) => void, milliseconds: number) {
    this._callback = callback;
    this._milliseconds = milliseconds;
  }

  doCallback = (value: boolean) => {
    if (!this._active) {
      clearInterval(this._intervalId);
      this._intervalId = null;
      return;
    }

    this._previousTime = Date.now();
    this._callback(value);
  };

  /** PRIVATE. Exposed only for tests. */
  isActive() {
    return this._active;
  }

  /** Start the heartbeat. Idempotent. */
  start() {
    if (this._active) {
      return;
    }

    this._active = true;

    if (this._previousTime + this._milliseconds <= Date.now()) {
      this.doCallback(true);
    }

    if (this._intervalId === null) {
      this._intervalId = setInterval(this.doCallback, this._milliseconds, true);
    }
  }

  /** Stop the heartbeat. Idempotent. */
  stop() {
    this._active = false;
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
