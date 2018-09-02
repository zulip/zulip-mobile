/* @flow strict-local */
import type { Auth, ApiResponseSuccess, UserProfile } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseUserProfile = {|
  ...ApiResponseSuccess,
  ...UserProfile,
|};

/** See https://zulipchat.com/api/get-profile */
export default (auth: Auth, clientGravatar: boolean = true): Promise<ApiResponseUserProfile> =>
  apiGet(auth, 'users/me');
