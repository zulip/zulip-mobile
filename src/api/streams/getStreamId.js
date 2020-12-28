/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

type ApiResponseStreamId = {|
  ...ApiResponseSuccess,
  stream_id: number,
|};

/** See https://zulip.com/api/get-stream-id */
export default async (auth: Auth, stream: string): Promise<ApiResponseStreamId> =>
  apiGet(auth, 'get_stream_id', { stream });
