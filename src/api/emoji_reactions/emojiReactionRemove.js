/* @flow */
import type { Presences, Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default (
  auth: Auth,
  messageId: number,
  reactionType: string,
  emojiCode: string,
  emojiName: string,
): Presences =>
  apiDelete(auth, `messages/${messageId}/reactions`, res => res.presences, {
    reaction_type: reactionType,
    emoji_code: emojiCode,
    emoji_name: emojiName,
  });
