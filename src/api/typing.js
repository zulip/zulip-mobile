/* @flow */
import type { ApiResponse, Account, TypingOperation } from './apiTypes';
import { apiPost } from './apiFetch';

export default (auth: Account, recipients: string, operation: TypingOperation): Promise<ApiResponse> =>
  apiPost(auth, 'typing', res => res, {
    to: recipients,
    op: operation,
  });
