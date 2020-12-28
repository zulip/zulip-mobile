/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

type ApiResponseSubscriptionStatus = {|
  ...ApiResponseSuccess,
  is_subscribed: boolean,
|};

/**
 * Get whether a user is subscribed to a particular stream.
 *
 * See https://zulip.com/api/get-subscription-status for
 * documentation of this endpoint.
 */
export default (
  auth: Auth,
  userId: number,
  streamId: number,
): Promise<ApiResponseSubscriptionStatus> =>
  apiGet(auth, `users/${userId}/subscriptions/${streamId}`);
