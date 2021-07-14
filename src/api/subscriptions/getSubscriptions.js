/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Subscription } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseSubscriptions = {|
  ...$Exact<ApiResponseSuccess>,
  subscriptions: Subscription[],
|};

/** See https://zulip.com/api/get-subscriptions */
export default (auth: Auth): Promise<ApiResponseSubscriptions> =>
  apiGet(auth, 'users/me/subscriptions');
