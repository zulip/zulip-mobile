/* @flow */
import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default async (auth: Auth, streamId: number) =>
  apiPost(auth, 'mark_stream_as_read', res => res, {
    stream_id: streamId,
  });
