/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPatch } from '../apiFetch';

export default async (auth: Account, id: number): Promise<ApiResponse> =>
  apiPatch(auth, `messages/${id}`, res => res, {
    content: '',
  });
