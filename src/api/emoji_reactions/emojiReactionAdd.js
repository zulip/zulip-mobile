/* @flow */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default (
  auth: Auth,
  messageId: number,
  reactionType: string,
  emojiCode: string,
  emojiName: string,
): Promise<ApiResponse> =>
  apiPost(auth, `messages/${messageId}/reactions`, res => res, {
    reaction_type: reactionType,
    emoji_code: emojiCode,
    emoji_name: emojiName,
  });
