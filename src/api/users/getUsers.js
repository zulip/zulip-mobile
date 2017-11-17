/* @flow */
import type { Auth } from '../../types';
import { apiGet } from '../apiFetch';

export default (auth: Auth): any =>
  apiGet(auth, 'users', res => res.members, { client_gravatar: true });
