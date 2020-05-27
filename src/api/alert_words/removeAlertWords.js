/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import type { AlertWordsState } from '../../types';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, alertWords: AlertWordsState): Promise<ApiResponse> =>
  apiDelete(auth, 'users/me/alert_words', {
    alert_words: JSON.stringify(alertWords),
  });
