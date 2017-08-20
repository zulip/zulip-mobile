/* @flow */
import type { Presences, Auth } from '../types';
import { apiPost } from './apiFetch';

export default (auth: Auth, hasFocus: boolean = true, newUserInput: boolean = false): Presences =>
  apiPost(auth, 'users/me/presence', res => res, {
    status: hasFocus ? 'active' : 'idle',
    new_user_input: newUserInput,
  });
