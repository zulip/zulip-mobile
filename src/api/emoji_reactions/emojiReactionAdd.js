/* @flow */
import type { Presences, Auth } from '../../types';
import { apiPut } from '../apiFetch';

export default (auth: Auth, messageId: number, emojiName: string): Presences =>
  apiPut(auth, `messages/${messageId}/emoji_reactions/${emojiName}`, res => res.presences);
