/* @flow */
import type { Account, RealmEmojiState } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Account): Promise<RealmEmojiState> =>
  apiGet(auth, 'realm/emoji', res => res.emoji);
