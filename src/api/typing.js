/* @flow strict-local */
import type { ApiResponse, Auth } from './transportTypes';
import type { UserId } from './idTypes';
import { apiPost } from './apiFetch';

type TypingOperation = 'start' | 'stop';

/** See https://zulip.com/api/set-typing-status */
export default (
  auth: Auth,
  recipients: $ReadOnlyArray<UserId>,
  operation: TypingOperation,
): Promise<ApiResponse> =>
  apiPost(auth, 'typing', {
    to: JSON.stringify(recipients),
    op: operation,
  });
