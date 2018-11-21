/* @flow */
import type { ApiResponse, Account, TypingOperation } from './apiTypes';
import { apiPost } from './apiFetch';

export default (account: Account, recipients: string, operation: TypingOperation): Promise<ApiResponse> =>
  apiPost(account, 'typing', res => res, {
    to: recipients,
    op: operation,
  });
