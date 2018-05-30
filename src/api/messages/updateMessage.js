/* @flow */
import type { ApiResponse, Auth } from '../../types';
import { apiPatch } from '../apiFetch';
import { removeEmptyValues } from '../../utils/misc';

export default async (
  auth: Auth,
  messageId: number,
  content: ?string,
  topic: ?string,
): Promise<ApiResponse> =>
  apiPatch(auth, `messages/${messageId}`, res => res, removeEmptyValues({ content, topic }));
