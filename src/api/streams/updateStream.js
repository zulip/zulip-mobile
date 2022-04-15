/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import type { Stream } from '../modelTypes';
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
  params: $ReadOnly<{|
    description?: $PropertyType<Stream, 'description'>,
    new_name?: $PropertyType<Stream, 'name'>,

    // controls the invite_only property
    is_private?: $PropertyType<Stream, 'invite_only'>,
  |}>,
): Promise<ApiResponse> => apiPatch(auth, `streams/${id}`, params);
