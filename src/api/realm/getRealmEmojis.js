/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { RealmEmojiById } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseRealmEmojis = {|
  ...ApiResponseSuccess,
  emoji: RealmEmojiById,
|};

export default async (auth: Auth): Promise<ApiResponseRealmEmojis> => apiGet(auth, 'realm/emoji');
