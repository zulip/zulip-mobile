import {Presences} from '../types';
import {apiPost, Auth} from './apiFetch';

export default (
  auth: Auth,
  hasFocus: boolean,
  newUserInput: boolean
): Presences =>
  apiPost(
    auth,
    'users/me/presence',
    {status: hasFocus ? 'active' : 'idle', new_user_input: newUserInput},
    res => res.presences
  );
