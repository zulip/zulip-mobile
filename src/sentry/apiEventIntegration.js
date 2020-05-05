// @flow strict-local

import type { Event, EventHint, EventProcessor, Hub, Integration } from '@sentry/react-native';
import { ApiError } from '../api/apiErrors';

const apiEventIntegration: Integration = {
  name: 'ApiEventIntegration',

  /**
   * Ensure that ApiError's additional data is included as part of the event's
   * fingerprint.
   *
   * See Sentry's documentation for more details:
   * https://docs.sentry.io/data-management/event-grouping/sdk-fingerprinting/?platform=javascript#group-errors-more-granularly
   */
  process(
    event: Event,
    hint?: EventHint = Object.freeze({}),
  ): Promise<Event | null> | Event | null {
    const exception = hint.originalException;
    if (!(exception instanceof ApiError)) {
      return event;
    }

    if (!event.fingerprint) {
      event.fingerprint = ['{{ default }}'];
    }
    event.fingerprint.push(exception.code, exception.httpStatus.toString());

    // These are for humans, not for computers.
    if (!event.extra) {
      event.extra = {};
    }
    const extra = event.extra;
    // The only significance to these keys is that Sentry displays "extra" data
    // sorted by key.
    extra['ApiError: 1) route'] = `${exception.call.method.toUpperCase()} /${exception.call.route}`;
    extra['ApiError: 2) params'] = exception.call.params;
    extra['ApiError: 3) status'] = exception.httpStatus;
    extra['ApiError: 4) Zulip code'] = exception.code;
    extra['ApiError: 5) return data'] = exception.data;

    return event;
  },

  setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub) {
    addGlobalEventProcessor(this.process);
  },
};

export default apiEventIntegration;
