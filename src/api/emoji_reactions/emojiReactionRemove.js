/* @flow strict-local */
import type { Auth, ApiResponse } from '../transportTypes';
import { apiDelete } from '../apiFetch';

export default (
  auth: Auth,
  messageId: number,
  reactionType: string,
  emojiCode: string,
  emojiName: string,
): Promise<ApiResponse> =>
  apiDelete(auth, `messages/${messageId}/reactions`, {
    reaction_type: reactionType,
    emoji_code: emojiCode,
    emoji_name: emojiName,
  });
