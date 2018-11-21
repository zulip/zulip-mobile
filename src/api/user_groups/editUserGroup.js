/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPatch } from '../apiFetch';

export default async (account: Account, id: number): Promise<ApiResponse> =>
  apiPatch(account, `user_groups/${id}`);
