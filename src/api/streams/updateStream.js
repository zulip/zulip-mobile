/* @flow strict-local */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPatch } from '../apiFetch';

export default (
  auth: Auth,
  id: number,
  newValues: { [string]: string | boolean | number },
): Promise<ApiResponse> => apiPatch(auth, `streams/${id}`, { ...newValues });
