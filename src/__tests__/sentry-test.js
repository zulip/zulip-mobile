// @flow

import * as Sentry from '@sentry/react-native';

describe('sentry', () => {
  describe('is usable without initialization', () => {
    const expectSentryUninitialized = () => {
      // Hub#getClient() is documented as possibly returning undefined, but the
      // significance of `undefined` is not. In practice, it appears to be
      // `undefined` exactly when `Sentry.init()` has not yet been called.
      expect(Sentry.getCurrentHub().getClient()).toBeUndefined();
    };

    test('breadcrumbs', () => {
      expectSentryUninitialized();

      Sentry.addBreadcrumb({
        message: 'test message',
        level: Sentry.Severity.Debug,
      });
    });

    test('exception reporting', () => {
      expectSentryUninitialized();

      // The text here is intended to prevent some hypothetical future reader of
      // Sentry event logs dismissing the error as harmless expected noise, in
      // case Sentry is somehow actually initialized at this point.
      const err = new Error('Jest test error; should not result in a Sentry event');
      Sentry.captureException(err);
    });
  });
});
