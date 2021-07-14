/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from './transportTypes';
import type { Topic } from './apiTypes';
import { apiGet } from './apiFetch';

type ApiResponseTopics = {|
  ...$Exact<ApiResponseSuccess>,
  topics: Topic[],
|};

/** See https://zulip.com/api/get-stream-topics */
export default async (auth: Auth, streamId: number): Promise<ApiResponseTopics> =>
  apiGet(auth, `users/me/${streamId}/topics`);
