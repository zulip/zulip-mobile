/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiDelete } from '../apiFetch';

export default async (auth: Auth, id: number): Promise<ApiResponse> =>
  apiDelete(auth, `user_groups/${id}`);
