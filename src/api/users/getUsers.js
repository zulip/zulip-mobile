/* @flow */
import type { Auth, ApiUser } from '../../types';
import { apiGet } from '../apiFetch';

export default (auth: Auth): Promise<ApiUser[]> =>
  apiGet(auth, 'users', res => res.members, { client_gravatar: true });
