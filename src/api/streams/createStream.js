/* @flow */
import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default (
  auth: Auth,
  subscriptions: Object[],
  principals: string[],
  inviteOnly: boolean,
  announce: boolean,
) =>
  apiPost(auth, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify(subscriptions),
    principals: JSON.stringify(principals),
    invite_only: inviteOnly,
    announce,
  });
