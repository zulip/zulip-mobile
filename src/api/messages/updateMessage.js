/* @flow */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPatch } from '../apiFetch';

/** See https://zulipchat.com/api/update-message */
export default async (auth: Auth, content: Object, id: number): Promise<ApiResponse> =>
  apiPatch(auth, `messages/${id}`, content);
