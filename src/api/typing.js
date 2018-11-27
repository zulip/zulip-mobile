/* @flow strict-local */
import type { ApiResponse, Auth, TypingOperation } from './apiTypes';
import { apiPost } from './apiFetch';

export default (auth: Auth, recipients: string, operation: TypingOperation): Promise<ApiResponse> =>
  apiPost(auth, 'typing', res => res, {
    to: recipients,
    op: operation,
  });
