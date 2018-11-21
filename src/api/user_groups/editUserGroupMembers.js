/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account, id: number): Promise<ApiResponse> =>
  apiPost(auth, `user_groups/${id}/members`);
