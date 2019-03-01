/* @flow strict-local */
import type { Auth } from '../transportTypes';
import { apiGet } from '../apiFetch';

export default (auth: Auth): Promise<mixed> => apiGet(auth, 'users/me/user_groups');
