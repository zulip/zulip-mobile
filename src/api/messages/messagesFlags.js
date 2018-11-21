/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default (
  account: Account,
  messages: number[],
  op: string,
  flag: string,
): Promise<ApiResponse> =>
  apiPost(account, 'messages/flags', res => res, { messages: JSON.stringify(messages), flag, op });
