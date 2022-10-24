/* @flow strict-local */
import invariant from 'invariant';

import type { UserSettings } from '../modelTypes';
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

// Assumes FL 89+ because the UserSettings type does; see note there.
//
// Current to FL 152. See the "Current to" note on the UserSettings type and
// update that as needed too.
//
// TODO(server-5.0): Remove FL 89+ comment.
type Args = {|
  ...$Rest<UserSettings, { ... }>,

  // These might move to a different endpoint in the future; see
  //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/User.20settings.20discrepancies/near/1457451
  +full_name?: string,
  +email?: string,
  +old_password?: string,
  +new_password?: string,
|};

/**
 * https://zulip.com/api/update-settings
 *
 * NOTE: Only supports servers at feature level 89+ because UserSettings
 * assumes 89+; see there.
 */
// TODO(server-5.0): Simplify FL 89+ requirement
export default (
  auth: Auth,
  args: Args,

  // TODO(#4659): Don't get this from callers.
  zulipFeatureLevel: number,
): Promise<ApiResponseSuccess> => {
  invariant(zulipFeatureLevel >= 89, 'api.updateUserSettings not supported with FL <89');

  return apiPatch(auth, 'settings', args);
};
