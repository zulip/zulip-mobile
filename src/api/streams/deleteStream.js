/* @flow strict-local */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, id: number): Promise<ApiResponse> => apiDelete(auth, `streams/${id}`);
