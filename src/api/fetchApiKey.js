/* @flow */
import type { Account, ApiResponseSuccess } from './apiTypes';
import { apiPost } from './apiFetch';

type ApiResponseFetchApiKey = ApiResponseSuccess & {
  email: string,
  api_key: string,
};

export default (account: Account, email: string, password: string): Promise<ApiResponseFetchApiKey> =>
  apiPost(account, 'fetch_api_key', res => res, { username: email, password });
