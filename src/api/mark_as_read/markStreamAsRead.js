/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default async (account: Account, streamId: number): Promise<ApiResponse> =>
  apiPost(account, 'mark_stream_as_read', res => res, {
    stream_id: streamId,
  });
