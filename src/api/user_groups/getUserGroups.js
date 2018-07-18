/* @flow */
import type { Auth } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default (auth: Auth): any => apiGet(auth, 'users/me/user_groups');
