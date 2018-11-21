/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default async (account: Account, id: number): Promise<ApiResponse> =>
  apiDelete(account, `user_groups/${id}`);
