/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default (
  account: Account,
  messageId: number,
  reactionType: string,
  emojiCode: string,
  emojiName: string,
): Promise<ApiResponse> =>
  apiPost(account, `messages/${messageId}/reactions`, res => res, {
    reaction_type: reactionType,
    emoji_code: emojiCode,
    emoji_name: emojiName,
  });
