/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPatch } from '../apiFetch';

export default (auth: Account, id: number, property: string, value: string): Promise<ApiResponse> =>
  apiPatch(auth, `streams/${id}`, res => res, {
    [property]: value,
  });
