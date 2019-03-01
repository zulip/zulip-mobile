/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, id: number): Promise<ApiResponse> => apiDelete(auth, `streams/${id}`);
