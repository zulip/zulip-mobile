/* @flow strict-local */
import invariant from 'invariant';

import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';
import type { UserId } from '../idTypes';

type ServerApiResponseReadReceipts = {|
  ...$Exact<ApiResponseSuccess>,
  +user_ids: $ReadOnlyArray<UserId>,
|};

/**
 * See https://zulip.com/api/get-read-receipts
 *
 * Should only be called for servers with FL 137+.
 */
// TODO(server-6.0): Stop mentioning a FL 137 condition.
export default async (
  auth: Auth,
  args: {|
    +message_id: number,
  |},

  // TODO(#4659): Don't get this from callers.
  zulipFeatureLevel: number,
): Promise<$ReadOnlyArray<UserId>> => {
  invariant(zulipFeatureLevel >= 137, 'api.getReadReceipts called for unsupporting server');

  const { message_id } = args;
  const response: ServerApiResponseReadReceipts = await apiGet(
    auth,
    `messages/${message_id}/read_receipts`,
  );

  return response.user_ids;
};
