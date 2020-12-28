/* @flow strict-local */
import type { Auth, ApiResponseSuccess } from '../transportTypes';
import type { User } from '../apiTypes';
import { apiGet } from '../apiFetch';

type ApiResponseUsers = {|
  ...ApiResponseSuccess,
  members: $ReadOnlyArray<{| ...User, avatar_url: string | null |}>,
|};

// TODO: If we start to use this, we need to convert `.avatar_url` to
// an AvatarURL instance, like we do in `registerForEvents` and
// `EVENT_USER_ADD` and `EVENT_USER_UPDATE`.

/** See https://zulip.com/api/get-all-users */
export default (auth: Auth): Promise<ApiResponseUsers> =>
  apiGet(auth, 'users', { client_gravatar: true });
