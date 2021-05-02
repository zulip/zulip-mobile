/* @flow strict-local */
import type { ApiResponse, Auth } from './transportTypes';
import { apiPost } from './apiFetch';

type TypingOperation = 'start' | 'stop';

/** See https://zulip.com/api/set-typing-status */
export default (auth: Auth, recipients: string, operation: TypingOperation): Promise<ApiResponse> =>
  apiPost(auth, 'typing', {
    to: recipients,
    op: operation,
  });
