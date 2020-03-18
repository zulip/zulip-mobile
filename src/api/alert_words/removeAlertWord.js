/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, alertWord: Array<string>): Promise<ApiResponse> =>
  apiDelete(auth, 'users/me/alert_words', {
    alert_words: JSON.stringify(alertWord),
  });
