/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiPatch } from '../apiFetch';

export default async (auth: Auth, id: number): Promise<ApiResponse> =>
  apiPatch(auth, `messages/${id}`, res => res, {
    content: '',
  });
