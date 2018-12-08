/* @flow strict-local */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPatch } from '../apiFetch';

export default async (auth: Auth, id: number): Promise<ApiResponse> =>
  apiPatch(auth, `messages/${id}`, res => res, {
    content: '',
  });
