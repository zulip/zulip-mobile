/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (account: Account, id: number): Promise<ApiResponse> =>
  apiDelete(account, `streams/${id}`);
