/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { type UserId } from '../idTypes';
import { apiGet } from '../apiFetch';

type ApiResponseUserProfile = {|
  ...ApiResponseSuccess,
  client_id: string,
  email: string,
  full_name: string,
  is_admin: boolean,
  is_bot: boolean,
  max_message_id: number,
  short_name: string,
  user_id: UserId,
  // pointer: number, /* deprecated 2020-02; see zulip/zulip#8994 */
|};

/** See https://zulip.com/api/get-own-user */
export default (auth: Auth, clientGravatar: boolean = true): Promise<ApiResponseUserProfile> =>
  apiGet(auth, 'users/me');
