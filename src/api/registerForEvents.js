/* @flow strict-local */
import invariant from 'invariant';

import type { RawInitialData, InitialData } from './initialDataTypes';
import type { Auth } from './transportTypes';
import type { CrossRealmBot, User } from './modelTypes';
import { apiPost } from './apiFetch';
import { AvatarURL } from '../utils/avatar';

const transformUser = (rawUser: {| ...User, avatar_url?: string | null |}, realm: URL): User => {
  const { avatar_url: rawAvatarUrl, email } = rawUser;

  return {
    ...rawUser,
    avatar_url: AvatarURL.fromUserOrBotData({
      rawAvatarUrl,
      email,
      userId: rawUser.user_id,
      realm,
    }),
  };
};

const transformCrossRealmBot = (
  rawCrossRealmBot: {| ...CrossRealmBot, avatar_url?: string | null |},
  realm: URL,
): CrossRealmBot => {
  const { avatar_url: rawAvatarUrl, user_id: userId, email } = rawCrossRealmBot;

  return {
    ...rawCrossRealmBot,
    avatar_url: AvatarURL.fromUserOrBotData({ rawAvatarUrl, userId, email, realm }),
  };
};

const transform = (rawInitialData: RawInitialData, auth: Auth): InitialData => ({
  ...rawInitialData,

  // Transform the newer `realm_linkifiers` format, if present, to the
  // older `realm_filters` format. We do the same transformation on
  // 'realm_linkifiers' events.
  // TODO(server-4.0): Switch to new format, if we haven't already;
  //   and drop conversion.
  realm_filters: rawInitialData.realm_linkifiers
    ? rawInitialData.realm_linkifiers.map(({ pattern, url_format, id }) => [
        pattern,
        url_format,
        id,
      ])
    : rawInitialData.realm_filters,

  // In 5.0 (feature level 100), the representation the server sends for "no
  // limit" changed from 0 to `null`.
  //
  // It's convenient to emulate Server 5.0's representation in our own data
  // structures. To get a correct initial value, it's sufficient to coerce
  // `0` to null here, without even looking at the server feature level.
  // That's because, in addition to the documented change in 5.0, there was
  // another: 0 became an invalid value, which means we don't have to
  // anticipate servers 5.0+ using it to mean anything, such as "0 seconds":
  //   https://github.com/zulip/zulip/blob/b13bfa09c/zerver/lib/message.py#L1482.
  //
  // TODO(server-5.0) Remove this conditional.
  realm_message_content_delete_limit_seconds:
    rawInitialData.realm_message_content_delete_limit_seconds === 0
      ? null
      : rawInitialData.realm_message_content_delete_limit_seconds,

  realm_users: rawInitialData.realm_users.map(rawUser => transformUser(rawUser, auth.realm)),
  realm_non_active_users: rawInitialData.realm_non_active_users.map(rawNonActiveUser =>
    transformUser(rawNonActiveUser, auth.realm),
  ),
  cross_realm_bots: rawInitialData.cross_realm_bots.map(rawCrossRealmBot =>
    transformCrossRealmBot(rawCrossRealmBot, auth.realm),
  ),

  // The doc says the field will be removed in a future release. So, while
  // we're still consuming it, fill it in if missing, with instructions from
  // the doc:
  //
  // > Its value will always equal
  // >   `can_create_public_streams || can_create_private_streams`.
  //
  // TODO(server-5.0): Only use `can_create_public_streams` and
  //   `can_create_private_streams`, and simplify this away.
  can_create_streams:
    rawInitialData.can_create_streams
    ?? (() => {
      const canCreatePublicStreams = rawInitialData.can_create_public_streams;
      const canCreatePrivateStreams = rawInitialData.can_create_private_streams;
      invariant(
        canCreatePublicStreams != null && canCreatePrivateStreams != null,
        'these are both present if can_create_streams is missing; see doc',
      );
      return canCreatePublicStreams || canCreatePrivateStreams;
    })(),
});

/** See https://zulip.com/api/register-queue */
export default async (
  auth: Auth,
  params?: {|
    queue_lifespan_secs?: number,
  |},
): Promise<InitialData> => {
  const rawInitialData: RawInitialData = await apiPost(auth, 'register', {
    ...params,

    // These parameters affect the types of what we receive from the
    // server, which means that the types described in these API bindings
    // assume these are the values we pass.  So we fix them here, inside the
    // API bindings.  (If there were a need for these API bindings to be
    // used in situations with some of these parameters varying, we could
    // solve that problem, but we haven't yet had a need to.)
    //
    // If we ever condition one of these parameters on the server's version
    // or feature level, take care that either that data is up to date or
    // it's OK that it isn't.  This is where we set up the event queue that
    // would keep us up to date on that, so it's much easier for it to be
    // stale here than for most other API endpoints.
    apply_markdown: true,
    client_gravatar: true,
    client_capabilities: JSON.stringify({
      notification_settings_null: true,
      bulk_message_deletion: true,
      user_avatar_url_field_optional: true,
    }),
    include_subscribers: false,
    fetch_event_types: JSON.stringify([
      // Event types not supported by the server are ignored; see
      //   https://zulip.com/api/register-queue#parameter-fetch_event_types.
      'alert_words',
      'message',
      'muted_topics',
      'muted_users',
      'presence',
      'realm',
      'realm_emoji',
      'realm_filters',
      'realm_linkifiers',
      'realm_user',
      'realm_user_groups',
      'recent_private_conversations',
      'stream',
      'subscription',
      'update_display_settings',
      'update_global_notifications',
      'update_message_flags',
      'user_settings',
      'user_status',
      'zulip_version',
    ]),

    // These parameters can be useful for bots, but the choices encoded in
    // `fetch_event_types` above aren't designed for such bots.  So
    // flexibility here is unlikely to be useful without flexibility there.
    // Until/unless we have a use case for such flexibility in these API
    // bindings, we simplify the interface by leaving them out.
    //
    // narrow: …,
    // all_public_streams: …,
  });
  return transform(rawInitialData, auth);
};
