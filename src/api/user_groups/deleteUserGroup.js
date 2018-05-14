/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default async (auth: Auth, id: number): Promise<ApiResponse> =>
  apiDelete(auth, `user_groups/${id}`);
