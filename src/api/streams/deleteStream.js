/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (auth: Account, id: number): Promise<ApiResponse> =>
  apiDelete(auth, `streams/${id}`);
