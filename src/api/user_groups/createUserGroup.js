/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default async (auth: Auth): Promise<ApiResponse> =>
  apiPost(auth, 'user_groups/create', res => res);
