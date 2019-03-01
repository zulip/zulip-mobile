/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { RealmEmojiState } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseRealmEmojis = {|
  ...ApiResponseSuccess,
  emoji: RealmEmojiState,
|};

export default async (auth: Auth): Promise<ApiResponseRealmEmojis> => apiGet(auth, 'realm/emoji');
