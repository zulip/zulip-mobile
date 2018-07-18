/* @flow */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default (auth: Auth, messages: number[], op: string, flag: string): Promise<ApiResponse> =>
  apiPost(auth, 'messages/flags', res => res, { messages: JSON.stringify(messages), flag, op });
