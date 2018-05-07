/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, id: number): Promise<ApiResponse> =>
  apiDelete(auth, `streams/${id}`, res => res);
