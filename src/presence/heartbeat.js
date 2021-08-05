// @flow strict-local

/**
 * Heartbeat: Perform callbacks at regular intervals.
 *
 * While active, calls `callback` every `milliseconds` milliseconds.
 * While inactive, does nothing.
 *
 * On becoming active, the first call to `callback` comes immediately,
 * or one full period after the last call made when previously active,
 * whichever is later.
 *
 * (Despite the generic-looking definition, this class is closely tailored to
 * user-presence reporting.)
 */
class Heartbeat {
  // There are three possible states -- off, on, and zombie:
  //
  //                   "off"      "zombie"       "on"
  //   _active         false       false         true
  //   _intervalId      null      non-null     non-null
  //
  // The state machine is (omitting no-op transitions):
  //
  //  --init---> off ----start()---------\
  //              ^                       \
  //              |                       |
  //         doCallback()                 |
  //              |                       |
  //              |  /---start()--\       |
  //              | /              v      /
  //           zombie <--stop()--- on <--/
  //
  // The "zombie" state has a visible difference from "off" if we end
  // up calling start() again before the interval next fires: it's how
  // we make sure to call the callback on the original regular schedule,
  // rather than another full interval after the new start() call.

  _callback: () => void;
  _milliseconds: number;

  _active: boolean = false;
  _intervalId: IntervalID | null = null;

  constructor(callback: () => void, milliseconds: number) {
    this._callback = callback;
    this._milliseconds = milliseconds;
  }

  doCallback: () => void = () => {
    if (!this._active) {
      clearInterval(this._intervalId);
      this._intervalId = null;
      return;
    }

    this._callback();
  };

  /** PRIVATE. Exposed only for tests. */
  isActive(): boolean {
    return this._active;
  }

  /** Start the heartbeat. Idempotent. */
  start() {
    if (this._active) {
      return;
    }

    this._active = true;

    if (this._intervalId === null) {
      this.doCallback();
      this._intervalId = setInterval(this.doCallback, this._milliseconds);
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
