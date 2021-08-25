// @flow strict-local

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
  | {| recipient_type: 'stream', stream: string, topic: string, realm_uri: string |}
  // Group PM messages have `pm_users`, which is sorted, comma-separated IDs.
  | {| recipient_type: 'private', pm_users: string, realm_uri: string |}
  // 1:1 PM messages lack `pm_users`.
  | {| recipient_type: 'private', sender_email: string, realm_uri: string |};
