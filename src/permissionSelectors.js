/* @flow strict-local */
import type { PerAccountState } from './types';
import { ensureUnreachable } from './types';
import { Role } from './api/permissionsTypes';
import { getRealm, getOwnUser } from './selectors';

// eslint-disable-next-line no-unused-vars
const { Guest, Member, Moderator, Admin, Owner } = Role;

/**
 * Whether the self-user can create or edit a stream to be web-public.
 *
 * True just if:
 * - the server has opted into the concept of web-public streams (see
 *   server_web_public_streams_enabled in
 *   https://zulip.com/api/register-queue), and
 * - spectator access is enabled (see realm_enable_spectator_access in
 *   https://zulip.com/api/register-queue), and
 * - the user's role is high enough, according to the realm's policy (see
 *   realm_users[].role and realm_create_web_public_stream_policy in
 *   https://zulip.com/api/register-queue)
 *
 * Like user_can_create_web_public_streams in the web-app's
 * static/js/settings_data.ts.
 */
export function getCanCreateWebPublicStreams(state: PerAccountState): boolean {
  const { webPublicStreamsEnabled, enableSpectatorAccess, createWebPublicStreamPolicy } = getRealm(
    state,
  );
  const ownUser = getOwnUser(state);
  const { role } = ownUser;

  if (!webPublicStreamsEnabled || !enableSpectatorAccess) {
    return false;
  }

  // Web-public streams weren't available until 5.0, in FL 103. (See
  // InitialDataRealm.realm_create_web_public_stream_policy.) If `User.role`
  // is missing, that means we're before FL 59 (see `User.role`), so we
  // definitely don't have web-public streams.
  // TODO(server-4.0): Remove.
  if (role === undefined) {
    return false;
  }

  switch (createWebPublicStreamPolicy) {
    // FlowIssue: sad that we end up having to write numeric literals here :-/
    //   But the most important thing to get from the type-checker here is
    //   that the ensureUnreachable works -- that ensures that when we add a
    //   new possible value, we'll add a case for it here.  Couldn't find a
    //   cleaner way to write this that still accomplished that. Discussion:
    //     https://github.com/zulip/zulip-mobile/pull/5384#discussion_r875147220
    case 6: // CreateWebPublicStreamPolicy.Nobody
      return false;
    case 7: // CreateWebPublicStreamPolicy.OwnerOnly
      return role === Owner;
    case 2: // CreateWebPublicStreamPolicy.AdminOrAbove
      return role === Owner || role === Admin;
    case 4: // CreateWebPublicStreamPolicy.ModeratorOrAbove
      return role === Owner || role === Admin || role === Moderator;
    default: {
      ensureUnreachable(createWebPublicStreamPolicy);

      // (Unreachable as long as the cases are exhaustive.)
      return false;
    }
  }
}
