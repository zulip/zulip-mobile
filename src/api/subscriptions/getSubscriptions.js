/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { Subscription } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseSubscriptions = {|
  ...ApiResponseSuccess,
  subscriptions: Subscription[],
|};

/** See https://zulip.com/api/get-subscribed-streams */
export default (auth: Auth): Promise<ApiResponseSubscriptions> =>
  apiGet(auth, 'users/me/subscriptions');
