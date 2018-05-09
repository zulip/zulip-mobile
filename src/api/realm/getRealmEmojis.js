/* @flow */
import type { Auth, RealmEmojiState } from '../../types';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<RealmEmojiState> =>
  apiGet(auth, 'realm/emoji', res => res.emoji);
