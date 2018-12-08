/* @flow strict-local */
import type { Auth, RealmEmojiState } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<RealmEmojiState> =>
  apiGet(auth, 'realm/emoji', res => res.emoji);
