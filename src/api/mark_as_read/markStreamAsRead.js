/* @flow strict-local */
import type { ApiResponse, Auth } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, streamId: number): Promise<ApiResponse> =>
  apiPost(auth, 'mark_stream_as_read', res => res, {
    stream_id: streamId,
  });
