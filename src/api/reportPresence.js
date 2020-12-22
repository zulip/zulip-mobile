/* @flow strict-local */
import type { ApiResponse, Auth } from './transportTypes';
import type { UserPresence } from './apiTypes';
import { apiPost } from './apiFetch';

type ApiResponseWithPresence = {|
  ...ApiResponse,
  server_timestamp: number,
  presences: {| [email: string]: UserPresence |},
|};

/** See https://zulip.readthedocs.io/en/latest/subsystems/presence.html . */
export default (
  auth: Auth,
  isActive: boolean = true,
  newUserInput: boolean = false,
): Promise<ApiResponseWithPresence> =>
  apiPost(auth, 'users/me/presence', {
    status: isActive ? 'active' : 'idle',
    new_user_input: newUserInput,
  });
