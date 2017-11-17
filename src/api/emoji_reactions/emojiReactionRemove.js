/* @flow */
import type { Presences, Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, messageId: number, emojiName: string): Presences =>
  apiDelete(auth, `messages/${messageId}/emoji_reactions/${emojiName}`, res => res.presences);
