/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPatch } from '../apiFetch';

export default (account: Account, id: number, property: string, value: string): Promise<ApiResponse> =>
  apiPatch(account, `streams/${id}`, res => res, {
    [property]: value,
  });
