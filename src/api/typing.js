/* @flow strict-local */
import type { ApiResponse, Auth, TypingOperation } from './apiTypes';
import { apiPost } from './apiFetch';

/** See https://zulipchat.com/api/typing */
export default (auth: Auth, recipients: string, operation: TypingOperation): Promise<ApiResponse> =>
  apiPost(auth, 'typing', {
    to: recipients,
    op: operation,
  });
