// @flow strict-local

import { type UserId } from './idTypes';

// This format is as of 2020-02, commit 3.0~3347.
type BaseData = $ReadOnly<{|
  message_ids: [number], // single-element tuple!

  realm_uri: string, // as in `/server_settings` response

  // The server and realm_id are an obsolete substitute for realm_uri.
  server: string, // settings.EXTERNAL_HOST
  realm_id: number, // server-internal realm identifier

  // The user this notification is addressed to; our self-user.
  // (This lets us distinguish different accounts in the same realm.)
  // added 2.1-dev-540-g447a517e6f, release 2.1.0+
  // TODO(server-2.1): Simplify comment.
  user_id: UserId, // recipient id

  sender_email: string,
  sender_id: UserId,
|}>;

type StreamData = $ReadOnly<{|
  ...BaseData,
  recipient_type: 'stream',
  stream: string,
  topic: string,
|}>;

type PmData = $ReadOnly<{|
  ...BaseData,
  recipient_type: 'private',

  // present only on group PMs
  pm_users?: string, // CSV of int (user ids)
|}>;

/** An APNs message sent by the Zulip server. */
export type ApnsPayload = $ReadOnly<{
  zulip: StreamData | PmData,
  ...
}>;
