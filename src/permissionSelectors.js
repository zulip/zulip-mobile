/* @flow strict-local */
import type { PerAccountState, UserId } from './types';
import { ensureUnreachable } from './types';
import { Role, type RoleT } from './api/permissionsTypes';
import { getRealm, getOwnUser, getUserForId } from './selectors';

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
 * Whether the user has passed the realm's waiting period to be a full member.
 *
 * See:
 *   https://zulip.com/api/roles-and-permissions#determining-if-a-user-is-a-full-member
 *
 * To determine if a user is a full member, callers must also check that the
 * user's role is at least Role.Member.
 *
 * Note: If used with useSelector, the value will be out-of-date, though
 * realistically only by seconds or minutes at most; see implementation.
 */
export function getHasUserPassedWaitingPeriod(state: PerAccountState, userId: UserId): boolean {
  const { waitingPeriodThreshold } = getRealm(state);
  const { date_joined } = getUserForId(state, userId);

  const intervalLengthInDays = (Date.now() - Date.parse(date_joined)) / 86400_000;

  // When used with useSelector, the result will be based on the time at
  // which the most recent Redux action was dispatched. This would break
  // if we made this a caching selector; don't do that.
  // TODO(?): To upper-bound how long ago that can be, we could dispatch
  //   actions at a regular short-ish interval. If those actions
  //   contained a current-date value, we could even store that value in
  //   Redux and consume it here, letting this be a caching selector if
  //   we wanted it to be.
  return intervalLengthInDays >= waitingPeriodThreshold;
}

/**
 * Whether the self-user is authorized to create or edit a stream to be
 *   public.
 *
 * Note: This isn't about web-public streams. For those, see
 * getCanCreateWebPublicStreams.
 */
export function getCanCreatePublicStreams(state: PerAccountState): boolean {
  const { createPublicStreamPolicy } = getRealm(state);
  const ownUser = getOwnUser(state);
  const role = getOwnUserRole(state);

  switch (createPublicStreamPolicy) {
    case 4: // ModeratorOrAbove
      return roleIsAtLeast(role, Moderator);
    case 3: // FullMemberOrAbove
      return role === Member
        ? getHasUserPassedWaitingPeriod(state, ownUser.user_id)
        : roleIsAtLeast(role, Member);
    case 2: // AdminOrAbove
      return roleIsAtLeast(role, Admin);
    case 1: // MemberOrAbove
      return roleIsAtLeast(role, Member);
    default: {
      ensureUnreachable(createPublicStreamPolicy);

      // (Unreachable as long as the cases are exhaustive.)
      return false;
    }
  }
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
