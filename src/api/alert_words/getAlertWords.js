/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';
import type { AlertWordsState } from '../../types';

type ApiResponseAlertWords = {|
  ...ApiResponseSuccess,
  alert_words: AlertWordsState,
|};

export default async (auth: Auth): Promise<ApiResponseAlertWords> =>
  apiGet(auth, 'users/me/alert_words');
