// @flow strict-local

import { type UserId } from './idTypes';

//
// Note: No code actually refers to these type definitions!
//
// The code that consumes this part of the API is in:
//   src/notification/extract.js
//   android/app/src/main/java/com/zulipmobile/notifications/FcmMessage.kt
// of which the latter is used on Android, and the former on iOS.
//
// The Android-side code doesn't use these because it's not in JS.
// (Moreover the data it receives is slightly different; see that code, or
// the server at zerver/lib/push_notifications.py , for details.)
//
// The JS-side code has a signature taking an arbitrary JSON blob, so that
// the type-checker can verify it systematically validates all the pieces it
// uses.  But these types describe the form of data it *expects* to receive.

// This format is as of 2020-02, commit 3.0~3347.
type BaseData = {|
  /** The realm URL, same as in the `/server_settings` response. */
  +realm_uri: string,

  // The server and realm_id are an obsolete substitute for realm_uri.
  -server: string, // settings.EXTERNAL_HOST
  -realm_id: number, // server-internal realm identifier

  /**
   * The user this notification is addressed to; our self-user.
   *
   * (This lets us distinguish different accounts in the same realm.)
   */
  // added 2.1-dev-540-g447a517e6f, release 2.1.0+
  // TODO(server-2.1): Mark required; simplify comment.
  +user_id?: UserId,

  // The rest of the data is about the Zulip message we're being notified
  // about.

  +message_ids: [number], // single-element tuple!

  +sender_id: UserId,
  +sender_email: string,

  // (... And see StreamData and PmData below.)
|};

/** For a notification about a stream message. */
type StreamData = {|
  ...BaseData,
  +recipient_type: 'stream',

  /**
   * The name of the message's stream.
   */
  +stream: string,

  // TODO(server-5.0): Require stream_id (#3918).
  // +stream_id?: number, // TODO(#3918): Add this, and use it.

  +topic: string,
|};

/** For a notification about a PM. */
type PmData = {|
  ...BaseData,
  +recipient_type: 'private',

  /**
   * The recipient user IDs, if this is a group PM; absent for 1:1 PMs.
   *
   * The user IDs are comma-separated ASCII decimal.
   *
   * (Does it include the self-user?  Are they sorted?  Unknown.)
   */
  +pm_users?: string,
|};

/** An APNs message sent by the Zulip server. */
// Note that no code actually refers to this type!  Rather it serves as
// documentation.  See module comment.
export type ApnsPayload = {|
  /** Our own data. */
  +zulip: StreamData | PmData,

  /**
   * Various Apple-specified fields.
   *
   * Upstream docs here:
   *   https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification
   */
  +aps: { ... },
|};
