/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (auth: Account, streamId: number): Promise<ApiResponse> =>
  apiPost(auth, 'mark_stream_as_read', res => res, {
    stream_id: streamId,
  });
