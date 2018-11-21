/* @flow */
import type { Account, RealmEmojiState } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (account: Account): Promise<RealmEmojiState> =>
  apiGet(account, 'realm/emoji', res => res.emoji);
