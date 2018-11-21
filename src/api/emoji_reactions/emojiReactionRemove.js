/* @flow */
import type { Account, ApiResponse } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (
  auth: Account,
  messageId: number,
  reactionType: string,
  emojiCode: string,
  emojiName: string,
): Promise<ApiResponse> =>
  apiDelete(auth, `messages/${messageId}/reactions`, res => res, {
    reaction_type: reactionType,
    emoji_code: emojiCode,
    emoji_name: emojiName,
  });
