/* @flow strict-local */
import type { RawInitialData, InitialData } from './initialDataTypes';
import type { Auth } from './transportTypes';
import type { ApiNarrow } from './apiTypes';
import type { CrossRealmBot, User } from './modelTypes';
import { apiPost } from './apiFetch';
import { AvatarURL } from '../utils/avatar';

type RegisterForEventsParams = {|
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
|};

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
  realm_filters: rawInitialData.realm_linkifiers
    ? rawInitialData.realm_linkifiers.map(({ pattern, url_format, id }) => [
        pattern,
        url_format,
        id,
      ])
    : rawInitialData.realm_filters,

  realm_users: rawInitialData.realm_users.map(rawUser => transformUser(rawUser, auth.realm)),
  realm_non_active_users: rawInitialData.realm_non_active_users.map(rawNonActiveUser =>
    transformUser(rawNonActiveUser, auth.realm),
  ),
  cross_realm_bots: rawInitialData.cross_realm_bots.map(rawCrossRealmBot =>
    transformCrossRealmBot(rawCrossRealmBot, auth.realm),
  ),
});

/** See https://zulip.com/api/register-queue */
export default async (auth: Auth, params: RegisterForEventsParams): Promise<InitialData> => {
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
