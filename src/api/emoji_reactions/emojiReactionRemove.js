/* @flow */
import type { Account, ApiResponse } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (
  account: Account,
  messageId: number,
  reactionType: string,
  emojiCode: string,
  emojiName: string,
): Promise<ApiResponse> =>
  apiDelete(account, `messages/${messageId}/reactions`, res => res, {
    reaction_type: reactionType,
    emoji_code: emojiCode,
    emoji_name: emojiName,
  });
