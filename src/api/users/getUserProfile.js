/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

type ApiResponseUserProfile = {|
  ...ApiResponseSuccess,
  client_id: string,
  email: string,
  full_name: string,
  is_admin: boolean,
  is_bot: boolean,
  max_message_id: number,
  pointer: number,
  short_name: string,
  user_id: number,
|};

/** See https://zulipchat.com/api/get-profile */
export default (auth: Auth, clientGravatar: boolean = true): Promise<ApiResponseUserProfile> =>
  apiGet(auth, 'users/me');
