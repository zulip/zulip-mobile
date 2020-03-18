/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

export default (auth: Auth, alertWords: Array<string>): Promise<ApiResponse> =>
  apiPost(auth, 'users/me/alert_words', { alert_words: JSON.stringify(alertWords) });
