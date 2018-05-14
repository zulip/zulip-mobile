/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, id: number): Promise<ApiResponse> =>
  apiPost(auth, `user_groups/${id}/members`);
