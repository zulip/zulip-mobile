// @flow

import * as Sentry from '@sentry/react-native';
import { isSentryActive } from '../sentry';

describe('sentry', () => {
  describe('is usable without initialization', () => {
    // Sentry shouldn't be active at all in debug mode -- certainly not while
    // we're specifically testing that its entry points can be used while it's
    // uninitialized.
    beforeEach(() => {
      expect(isSentryActive()).toBeFalse();
    });

    afterEach(() => {
      expect(isSentryActive()).toBeFalse();
    });

    test('breadcrumbs', () => {
      Sentry.addBreadcrumb({
        message: 'test message',
        level: Sentry.Severity.Debug,
      });
    });

    test('exception reporting', () => {
      // The text here is intended to prevent some hypothetical future reader of
      // Sentry event logs dismissing the error as harmless expected noise, in
      // case Sentry is somehow actually initialized at this point.
      const err = new Error('Jest test error; should not result in a Sentry event');
      Sentry.captureException(err);
    });
  });
});
