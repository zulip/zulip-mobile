/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

type ApiResponseAlertWords = {|
  ...ApiResponseSuccess,
  alert_words: string[],
|};

export default async (auth: Auth): Promise<ApiResponseAlertWords> =>
  apiGet(auth, 'users/me/alert_words');
