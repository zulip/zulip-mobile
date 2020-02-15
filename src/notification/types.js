// @flow strict-local

/**
 * The data we need in JS/React code for acting on a notification.
 *
 * The actual objects we describe with these types may have a bunch more
 * fields.  So, properly, these object types aren't really exact.  But
 * pretending they are seems to be the least unpleasant way to get Flow to
 * recognize the effect of refinements like `data.pm_users === undefined`.
 *
 * Currently:
 *
 *  * On iOS, these objects are translated directly, field by field, from
 *    the blobs of key/value pairs sent by the Zulip server in the
 *    "payload".  The set of fields therefore varies by server version.
 *
 *  * On Android, our platform-native code constructs the exact data to
 *    send; see `MessageFcmMessage#dataForOpen` in `FcmMessage.kt`.
 *    That should be kept in sync with this type definition, in which case
 *    these types really are exact.
 */
export type Notification =
  | {| recipient_type: 'stream', stream: string, topic: string, realm_uri?: string |}
  // Group PM messages have `pm_users`, which is comma-separated IDs.
  | {| recipient_type: 'private', pm_users: string, realm_uri?: string |}
  // 1:1 PM messages lack `pm_users`.
  | {| recipient_type: 'private', sender_email: string, realm_uri?: string |};
