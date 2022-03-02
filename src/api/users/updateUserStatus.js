/* @flow strict-local */
import type { UserStatus } from '../modelTypes';
import type { ApiResponseSuccess, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/**
 * https://zulip.com/api/update-status
 *
 * See doc for important requirements, like a character limit on the status
 * text.
 */
export default (
  auth: Auth,
  partialUserStatus: $Rest<UserStatus, { ... }>,
): Promise<ApiResponseSuccess> => {
  const { away, status_text, status_emoji } = partialUserStatus;

  const params = {};

  if (away !== undefined) {
    params.away = away;
  }

  if (status_text !== undefined) {
    params.status_text = status_text ?? '';
  }

  if (status_emoji !== undefined) {
    params.emoji_name = status_emoji?.emoji_name ?? '';
    params.emoji_code = status_emoji?.emoji_code ?? '';
    params.reaction_type = status_emoji?.reaction_type ?? '';
  }

  return apiPost(auth, 'users/me/status', params);
};
