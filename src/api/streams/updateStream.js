/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import type { StreamPostPolicy } from '../modelTypes';
import { apiPatch } from '../apiFetch';

export default (
  auth: Auth,
  id: number,
  property: string,
  value: string | boolean | StreamPostPolicy,
): Promise<ApiResponse> =>
  apiPatch(auth, `streams/${id}`, {
    [property]: value,
  });
