/* @flow */
import type { Auth } from '../../types';
import { apiDelete } from '../apiFetch';

export default (auth: Auth, subscriptions: string[]) =>
  apiDelete(auth, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify(subscriptions),
  });
