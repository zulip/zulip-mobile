/* @flow */
import type { Presences, Auth } from '../types';
import { apiPost } from './apiFetch';

export default (auth: Auth, hasFocus: boolean, newUserInput: boolean): Presences =>
  apiPost(auth, 'users/me/presence', res => res.presences, {
    status: hasFocus ? 'active' : 'idle',
    new_user_input: newUserInput,
  });
