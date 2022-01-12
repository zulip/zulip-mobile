// @flow strict-local

import { type UserId } from './idTypes';

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
  // TODO(server-2.1): Simplify comment.
  +user_id: UserId,

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
   *
   * Sadly no stream ID: https://github.com/zulip/zulip/issues/18067
   */
  +stream: string,

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
