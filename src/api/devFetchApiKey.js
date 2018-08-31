/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from './apiTypes';
import { apiPost } from './apiFetch';

type ApiResponseDevFetchApiKey = {|
  ...ApiResponseSuccess,
  api_key: string,
|};

export default (auth: Auth, email: string): Promise<ApiResponseDevFetchApiKey> =>
  apiPost(auth, 'dev_fetch_api_key', res => res, { username: email });
