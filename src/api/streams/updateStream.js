/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

/**
 * https://zulip.com/api/update-stream
 *
 * NB the caller must adapt for old-server compatibility; see comment.
 */
// TODO(#4659): Once we pass the feature level to API methods, this one
//   should encapsulate a switch at feature level 64.  See its call sites.
// TODO(server-4.0): Simplify that away.
export default (
  auth: Auth,
  id: number,
  property: string,
  value: string | boolean,
): Promise<ApiResponse> =>
  apiPatch(auth, `streams/${id}`, {
    [property]: value,
  });
