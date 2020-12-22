/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

export default (auth: Auth, messages: number[], op: string, flag: string): Promise<ApiResponse> =>
  apiPost(auth, 'messages/flags', { messages: JSON.stringify(messages), flag, op });
