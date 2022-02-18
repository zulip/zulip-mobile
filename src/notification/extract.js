/* @flow strict-local */
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import type { Notification } from './types';
import { makeUserId } from '../api/idTypes';
import type { JSONable, JSONableDict, JSONableInput, JSONableInputDict } from '../utils/jsonable';
import * as logging from '../utils/logging';

/** Confirm (or disprove) that a JSONableInput object is a dictionary. */
const asDict = (obj: JSONableInput | void): JSONableInputDict | void => {
  if (typeof obj !== 'object') {
    return undefined;
  }
  if (obj === null || obj instanceof Array) {
    return undefined;
  }
  return obj;
};

/** Local error type. */
class ApnsMsgValidationError extends logging.ExtendableError {
  extras: JSONable;
  constructor(message, extras: JSONable) {
    super(message);
    this.extras = extras;
  }
}

/** Private. Exported only for tests. */
//
// Extract Zulip notification data from a JSONable dictionary imported from an
// APNs notification.
//
// @returns A `Notification` on success, `undefined` on suppressible failure.
// @throws An ApnsMsgValidationError on unexpected failure.
//
export const fromAPNsImpl = (rawData: ?JSONableDict): Notification | void => {
  //
  // For the format this parses, see `ApnsPayload` in src/api/notificationTypes.js .
  //
  // Though what it actually receives is more like this:
  //   $Rest<ApnsPayload, {| aps: mixed |}>
  // because the `ApnsPayload` gets parsed by the `PushNotificationIOS`
  // library, and what it gives us through `getData` is everything but the
  // `aps` property.

  /** Helper function: fail. */
  const err = (style: string) =>
    new ApnsMsgValidationError(`Received ${style} APNs notification`, {
      // an `undefined` value would make `extras` not JSONable, but we will
      // want to know if the value is undefined
      data: rawData === undefined ? '__undefined__' : rawData,
    });

  if (rawData == null) {
    throw err('nullish');
  }

  // TODO: simplify this.
  const data: JSONableInputDict = rawData;

  // Always present; see `ApnsPayload`.
  const zulip: JSONableInputDict | void = asDict(data.zulip);
  if (!zulip) {
    throw err('alien');
  }

  // On Android, we also receive "remove" notification messages, tagged with an
  // `event` field with value 'remove'. As of 2.2-dev-775-g10e7e15088, however,
  // these are not yet sent to iOS devices, and we don't have a way to handle
  // them even if they were.
  //
  // The messages we currently do receive, and can handle, are analogous to
  // Android notification messages of event type 'message'. On the assumption
  // that some future version of the Zulip server will send explicit event types
  // in APNs messages, accept messages with that `event` value, but no other.
  const { event: eventType } = zulip;
  if (eventType !== 'message' && eventType !== undefined) {
    return undefined;
  }

  //
  // At this point we can begin trying to construct our `Notification`.
  //
  // For the format this code is parsing, see `ApnsPayload` in
  // src/api/notificationTypes.js .

  const { recipient_type } = zulip;
  if (recipient_type === undefined) {
    // Arguably not a real error, but we'd like to know when there are no longer
    // any of these servers left in the wild.
    throw err('archaic (pre-1.8.x)');
  }
  if (typeof recipient_type !== 'string') {
    throw err('invalid');
  }
  if (recipient_type !== 'stream' && recipient_type !== 'private') {
    throw err('invalid');
  }

  const { realm_uri, user_id } = zulip;
  if (realm_uri === undefined) {
    throw err('archaic (pre-1.9.x)');
  }
  if (typeof realm_uri !== 'string') {
    throw err('invalid');
  }
  if (user_id !== undefined && typeof user_id !== 'number') {
    throw err('invalid');
  }

  const identity = {
    realm_uri,
    ...(user_id === undefined ? Object.freeze({}) : { user_id: makeUserId(user_id) }),
  };

  if (recipient_type === 'stream') {
    const { stream: stream_name, topic } = zulip;
    if (typeof stream_name !== 'string' || typeof topic !== 'string') {
      throw err('invalid');
    }
    return {
      ...identity,
      recipient_type: 'stream',
      stream_name,
      topic,
    };
  } else {
    /* recipient_type === 'private' */
    const { sender_email, pm_users } = zulip;

    if (pm_users !== undefined) {
      if (typeof pm_users !== 'string') {
        throw err('invalid');
      }
      const ids = pm_users.split(',').map(s => parseInt(s, 10));
      if (ids.some(id => Number.isNaN(id))) {
        throw err('invalid');
      }
      return {
        ...identity,
        recipient_type: 'private',
        pm_users: ids.sort((a, b) => a - b).join(','),
      };
    }

    if (typeof sender_email !== 'string') {
      throw err('invalid');
    }
    return { ...identity, recipient_type: 'private', sender_email };
  }

  /* unreachable */
};

/**
 * Extract Zulip notification data from a JSONable dictionary imported from an
 * APNs notification. Logs validation errors as warnings.
 *
 * @returns A `Notification` on success; `undefined` on failure.
 */
const fromAPNs = (data: ?JSONableDict): Notification | void => {
  try {
    return fromAPNsImpl(data);
  } catch (err) {
    if (err instanceof ApnsMsgValidationError) {
      logging.warn(err.message, err.extras);
      return undefined;
    }
    throw err;
  }
};

// Despite the name `fromAPNs`, there is no parallel Android-side `fromFCM`
// function here; the relevant task is performed in `FcmMessage.kt`.

/**
 * Extract Zulip notification data from the blob our iOS libraries give us.
 *
 * On validation error (indicating a bug in either client or server),
 * logs a warning and returns void.
 *
 * On valid but unrecognized input (like a future, unknown type of
 * notification event), returns void.
 */
export const fromPushNotificationIOS = (notification: PushNotificationIOS): Notification | void => {
  // This is actually typed as ?Object (and so effectively `any`); but if
  // present, it must be a JSONable dictionary. It's giving us the
  // notification data, which was passed over APNs as JSON.
  const data: ?JSONableDict = notification.getData();
  return fromAPNs(data);
};
