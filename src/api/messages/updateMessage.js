/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiPatch } from '../apiFetch';
import { removeEmptyValues } from '../../utils/misc';

export default async (auth: Auth, content: Object, id: number): Promise<ApiResponse> =>
  apiPatch(auth, `messages/${id}`, res => res, removeEmptyValues(content));
