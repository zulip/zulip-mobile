// @flow strict-local

/* eslint-disable no-underscore-dangle */

let _allowUnhandled = false;

/**
 * (If using this, be sure to check for unhandled.)
 *
 * For example:

     beforeAll(() => immediate.allowUnhandled());
     afterAll(() => immediate.disallowUnhandled());
     afterEach(() => expect(immediate.takeUnhandled()).toEqual([]));

   Then each test can check for the expected unhandled errors like:

     expect(immediate.takeUnhandled()).toMatchObject([new Error('some message')]);

   or can explicitly discard unhandled errors, if desired, like:

     immediate.takeUnhandled();

 */
export function allowUnhandled() {
  _allowUnhandled = true;
}

export function disallowUnhandled() {
  _allowUnhandled = false;
}

let unhandledErrors: mixed[] = [];

// TODO also have a way to await for immediates to settle?
export function takeUnhandled(): mixed[] {
  const e = unhandledErrors;
  unhandledErrors = [];
  return e;
}

export function immediate(cb: () => void): void {
  if (!_allowUnhandled) {
    Promise.resolve().then(cb);
    return;
  }

  Promise.resolve().then(() => {
    try {
      cb();
    } catch (e) {
      unhandledErrors.push(e);
    }
  });
}

export default immediate;
immediate.allowUnhandled = allowUnhandled;
immediate.disallowUnhandled = disallowUnhandled;
immediate.takeUnhandled = takeUnhandled;
