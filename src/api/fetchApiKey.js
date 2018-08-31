/* @flow */
import type { Auth, ApiResponseSuccess } from './apiTypes';
import { apiPost } from './apiFetch';

type ApiResponseFetchApiKey = ApiResponseSuccess & {
  email: string,
  api_key: string,
};

export default (auth: Auth, email: string, password: string): Promise<ApiResponseFetchApiKey> =>
  apiPost(auth, 'fetch_api_key', res => res, { username: email, password });
