// @flow strict-local
import type { UserId } from '../types';

type NotificationBase = {|
  realm_uri: string,
  user_id?: UserId,
|};

/**
 * The data we need in JS/React code for acting on a notification.
 *
 * On iOS, these objects are constructed by our JS code from the data the
 * Zulip server sends in the APNs payload.  See `fromAPNs` in
 * `src/notifications/extract.js`.
 *
 * On Android, these objects are sent to JS from our platform-native code,
 * constructed there by `MessageFcmMessage#dataForOpen` in `FcmMessage.kt`.
 * The correspondence of that code with this type isn't type-checked.
 */
// NOTE: Keep the Android-side code in sync with this type definition.
export type Notification =
  // TODO(server-5.0): Rely on stream ID (#3918).  (We'll still want the
  //   stream name, as a hint for display in case the stream is unknown;
  //   see comment in getNarrowFromNotificationData.)
  // TODO(#3918): Add stream_id.
  | {| ...NotificationBase, recipient_type: 'stream', stream_name: string, topic: string |}
  // Group PM messages have `pm_users`, which is sorted, comma-separated IDs.
  | {| ...NotificationBase, recipient_type: 'private', pm_users: string |}
  // 1:1 PM messages lack `pm_users`.
  | {| ...NotificationBase, recipient_type: 'private', sender_email: string |};
