/* @flow strict-local */
import type { PerAccountState } from './types';
import { ensureUnreachable } from './types';
import { Role, type RoleT } from './api/permissionsTypes';
import { getRealm, getOwnUser } from './selectors';

const { Guest, Member, Moderator, Admin, Owner } = Role;

/**
 * The Role of the self-user.
 *
 * For servers at FL 59 (version 4.0) or above, this will be live-updated
 * when the role changes while we're polling an event queue.
 */
// TODO(server-4.0): Probably just delete this and use User.role directly?
export function getOwnUserRole(state: PerAccountState): RoleT {
  const fromUserObject = getOwnUser(state).role;

  if (fromUserObject !== undefined) {
    return fromUserObject;
  }

  // Servers don't send events to update these.
  const { isOwner, isAdmin, isModerator, isGuest } = getRealm(state);

  if (isOwner) {
    return Owner;
  } else if (isAdmin) {
    return Admin;
  } else if (isModerator) {
    return Moderator;
  } else if (isGuest) {
    return Guest;
  } else {
    return Member;
  }
}

export function roleIsAtLeast(thisRole: RoleT, thresholdRole: RoleT): boolean {
  return thisRole <= thresholdRole; // Roles with more privilege have lower numbers.
}

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
  const role = getOwnUserRole(state);

  if (!webPublicStreamsEnabled || !enableSpectatorAccess) {
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
      return roleIsAtLeast(role, Owner);
    case 2: // CreateWebPublicStreamPolicy.AdminOrAbove
      return roleIsAtLeast(role, Admin);
    case 4: // CreateWebPublicStreamPolicy.ModeratorOrAbove
      return roleIsAtLeast(role, Moderator);
    default: {
      ensureUnreachable(createWebPublicStreamPolicy);

      // (Unreachable as long as the cases are exhaustive.)
      return false;
    }
  }
}
