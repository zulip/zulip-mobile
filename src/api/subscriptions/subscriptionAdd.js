/* @flow */
import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default (auth: Auth, subscriptions: Object[]) =>
  apiPost(auth, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify(subscriptions),
  });
