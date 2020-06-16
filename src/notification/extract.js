/* @flow strict-local */
import type { Notification } from './types';
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

/*
    The Zulip APNs message format, as far back as 2013-03-23 [0], has always
    been some subtype of the following:

        type Data = { zulip: { ... } }

    (Comments in `zerver/lib/push_notifications.py` may appear to indicate
    otherwise, but these refer only to the format of inter-server messages for
    the Zulip-hosted push-notification bouncer service. Messages sent over APNs
    itself have always had a `zulip` field.)

    [0] GitHub commit 410ee44eb6e40bac4099d1851d949533026fe4b3.

    The original payload was merely `{ message_ids: [number] }`, but this has
    been expanded incrementally over the years. As of 2020-02, commit
    2.2-dev-775-g10e7e15088, the current form of APNs messages is as follows:

    ```
    type StreamData = {
        // added 1.7.0-1351-g98943a8333, release 1.8.0+
        recipient_type: 'stream',
        stream: string,
        topic: string,
    };

    type PmData = {
        // added 1.7.0-1351-g98943a8333, release 1.8.0+
        recipient_type: 'private',

        // added 1.7.0-2360-g693a9a5e70, release 1.8.0+
        // present only on group PMs
        pm_users?: string,  // CSV of int (user ids)
    };

    type Data = { zulip: {
        // present since antiquity
        message_ids: [number],  // single-element tuple!

        // added 1.7.0-1351-g98943a8333, release 1.8.0+
        sender_email: string,
        sender_id: UserId,
        server: string,     // settings.EXTERNAL_HOST
        realm_id: number,   // server-internal realm identifier

        // added 1.8.0-2150-g5f8d193bb7, release 1.9.0+
        realm_uri: string,  // as in `/server_settings` response

        // added 2.1-dev-540-g447a517e6f, release 2.1.0+
        user_id: UserId,    // recipient id

        ...(StreamData | PmData),
    } };
    ```

    Note that prior to 1.7.0-1351-g98943a8333, we only received the
    `message_ids` field. Messages of this form are not useful.

    The pair `(server, realm_id)`, added in the same commit, uniquely identifies
    a Zulip realm, and was originally intended to permit the client to associate
    a notification with its associated realm. Unfortunately, there is no way to
    get either of these from a server via the API, so this would not be possible
    until the addition of `realm_uri` in 1.8.0-2150-g5f8d193bb7...

    ... which still didn't permit differentiating between multiple accounts on
    the same realm. This was only made possible by the addition of the `user_id`
    field, in 2.1-dev-540-g447a517e6f.
*/

/** Local error type. */
class ApnsMsgValidationError extends Error {
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
// @throws An ApnsMsgValidationError on interesting failure.
//
export const fromAPNsImpl = (rawData: JSONableDict): Notification | void => {
  /** Helper function: fail. */
  const err = (style: string) =>
    new ApnsMsgValidationError(`Received ${style} APNs notification`, { data: rawData });

  // APNs messages are JSON dictionaries. The `aps` entry of this dictionary is
  // required, with a structure defined by Apple; all other entries are
  // available to the application.
  //
  // PushNotificationsIOS filters out `aps`, parses it, and hands us the rest
  // as "data". Pretty much any iOS notifications library should do
  // the same, but we don't rely on that.

  const data: JSONableInputDict = (() => {
    if ('aps' in rawData) {
      // eslint-disable-next-line no-unused-vars
      const { aps, ...rest } = rawData;
      return rest;
    } else {
      return rawData;
    }
  })();

  // Always present; see historical type definition, above.
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

  // At this point we can begin trying to construct our `Notification`.

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

  const { realm_uri } = zulip;
  if (realm_uri !== undefined && typeof realm_uri !== 'string') {
    throw err('invalid');
  }
  const realm_uri_obj = Object.freeze(realm_uri === undefined ? {} : { realm_uri });

  if (recipient_type === 'stream') {
    const { stream, topic } = zulip;
    if (typeof stream !== 'string' || typeof topic !== 'string') {
      throw err('invalid');
    }
    return {
      recipient_type: 'stream',
      stream,
      topic,
      ...realm_uri_obj,
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
        recipient_type: 'private',
        pm_users: ids.sort((a, b) => a - b).join(','),
        ...realm_uri_obj,
      };
    }

    if (typeof sender_email !== 'string') {
      throw err('invalid');
    }
    return { recipient_type: 'private', sender_email, ...realm_uri_obj };
  }

  /* unreachable */
};

/**
 * Extract Zulip notification data from a JSONable dictionary imported from an
 * APNs notification. Logs validation errors as warnings.
 *
 * @returns A `Notification` on success; `undefined` on failure.
 */
export const fromAPNs = (data: JSONableDict): Notification | void => {
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
