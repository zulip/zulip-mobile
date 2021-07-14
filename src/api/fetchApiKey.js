/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from './transportTypes';
import { apiPost } from './apiFetch';

type ApiResponseFetchApiKey = {|
  ...$Exact<ApiResponseSuccess>,
  email: string,
  api_key: string,
|};

export default (auth: Auth, email: string, password: string): Promise<ApiResponseFetchApiKey> =>
  apiPost(auth, 'fetch_api_key', { username: email, password });
