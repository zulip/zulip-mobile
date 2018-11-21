/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (account: Account, id: number): Promise<ApiResponse> =>
  apiPost(account, `user_groups/${id}/members`);
