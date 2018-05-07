/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiPatch } from '../apiFetch';

export default (auth: Auth, id: number, property: string, value: string): Promise<ApiResponse> =>
  apiPatch(auth, `streams/${id}`, res => res, {
    [property]: value,
  });
