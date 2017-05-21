/* @flow */
import { Auth } from '../types';
import { apiPost } from './apiFetch';

export default (
  auth: Auth,
  subscriptions: [],
) =>
  apiPost(
    auth,
    'users/me/subscriptions',
    res => res,
    { subscriptions: JSON.stringify(subscriptions) },
  );
