// @flow strict-local

/**
 * The data we need in JS/React code for acting on a notification.
 *
 * Currently:
 *  * On iOS, these objects are reconstructed in React Native from the APNs
 *    payload; the exactness of these type definitions is checked by Flow. (See
 *    `fromAPNs` in `src/notifications/extract.js`.)
 *
 *  * On Android, these objects are constructed by casting JSON objects from our
 *    platform-native code; they are exact iff that code is kept in sync. (See
 *    `MessageFcmMessage#dataForOpen` in `FcmMessage.kt`.)
 */
export type Notification =
  | {| recipient_type: 'stream', stream: string, topic: string, realm_uri?: string |}
  // Group PM messages have `pm_users`, which is comma-separated IDs.
  | {| recipient_type: 'private', pm_users: string, realm_uri?: string |}
  // 1:1 PM messages lack `pm_users`.
  | {| recipient_type: 'private', sender_email: string, realm_uri?: string |};
