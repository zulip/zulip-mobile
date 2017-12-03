/* @flow */
import type { Auth } from '../../types';
import { apiPost } from '../apiFetch';

export default (
  auth: Auth,
  name: string,
  description?: string = '',
  principals?: string[] = [],
  inviteOnly?: boolean = false,
  announce?: boolean = false,
) =>
  apiPost(auth, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify([{ name, description }]),
    principals: JSON.stringify(principals),
    invite_only: inviteOnly,
    announce,
  });
