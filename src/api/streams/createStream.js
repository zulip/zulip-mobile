/* @flow */
import type { ApiResponse, Account } from '../apiTypes';
import { apiPost } from '../apiFetch';

export default (
  account: Account,
  name: string,
  description?: string = '',
  principals?: string[] = [],
  inviteOnly?: boolean = false,
  announce?: boolean = false,
): Promise<ApiResponse> =>
  apiPost(account, 'users/me/subscriptions', res => res, {
    subscriptions: JSON.stringify([{ name, description }]),
    principals: JSON.stringify(principals),
    invite_only: inviteOnly,
    announce,
  });
