/* @flow strict-local */
import type { RawInitialData, InitialData } from './initialDataTypes';
import type { Auth } from './transportTypes';
import type { ApiNarrow } from './apiTypes';
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
});

/** See https://zulip.com/api/register-queue */
export default async (
  auth: Auth,
  params: {|
    apply_markdown?: boolean,
    client_gravatar?: boolean,
    all_public_streams?: boolean,
    event_types?: string[],
    fetch_event_types?: string[],
    include_subscribers?: boolean,
    narrow?: ApiNarrow,
    queue_lifespan_secs?: number,
    client_capabilities?: {|
      notification_settings_null: boolean,
      bulk_message_deletion: boolean,
      user_avatar_url_field_optional: boolean,
    |},
  |},
): Promise<InitialData> => {
  const { narrow, event_types, fetch_event_types, client_capabilities } = params;
  const rawInitialData = await apiPost(auth, 'register', {
    ...params,
    narrow: JSON.stringify(narrow),
    event_types: JSON.stringify(event_types),
    fetch_event_types: JSON.stringify(fetch_event_types),
    client_capabilities: JSON.stringify(client_capabilities),
  });
  return transform(rawInitialData, auth);
};
