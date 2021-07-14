/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from './transportTypes';
import { apiPost } from './apiFetch';

type ApiResponseDevFetchApiKey = {|
  ...$Exact<ApiResponseSuccess>,
  api_key: string,
|};

export default (auth: Auth, email: string): Promise<ApiResponseDevFetchApiKey> =>
  apiPost(auth, 'dev_fetch_api_key', { username: email });
