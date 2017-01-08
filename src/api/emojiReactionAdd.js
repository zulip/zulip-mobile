import { Presences } from '../types';
import { apiPut, Auth } from './apiFetch';

export default (
  auth: Auth,
  messageId: number,
  emojiName: string,
): Presences =>
  apiPut(
    auth,
    `messages/${messageId}/emoji_reactions/${emojiName}`,
    res => res.presences,
  );
