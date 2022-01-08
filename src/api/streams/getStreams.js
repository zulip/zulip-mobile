/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Stream } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseStreams = {|
  ...$Exact<ApiResponseSuccess>,
  streams: $ReadOnlyArray<Stream>,
|};

/** See https://zulip.com/api/get-streams */
export default async (auth: Auth): Promise<ApiResponseStreams> => apiGet(auth, 'streams');
