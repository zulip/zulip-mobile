/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, streamId: number): Promise<ApiResponse> =>
  apiPost(auth, 'mark_stream_as_read', {
    stream_id: streamId,
  });
