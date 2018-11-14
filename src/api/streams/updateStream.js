/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

export default (
  auth: Auth,
  id: number,
  property: string,
  value: string | boolean | number,
): Promise<ApiResponse> =>
  apiPatch(auth, `streams/${id}`, {
    [property]: value,
  });
