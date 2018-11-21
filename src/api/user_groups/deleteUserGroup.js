/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default async (auth: Account, id: number): Promise<ApiResponse> =>
  apiDelete(auth, `user_groups/${id}`);
