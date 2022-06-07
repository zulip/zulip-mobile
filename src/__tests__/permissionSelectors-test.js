/* @flow strict-local */
import invariant from 'invariant';

import { getOwnUser, tryGetActiveAccountState, getRealm } from '../selectors';
import {
  Role,
  RoleValues,
  type RoleT,
  CreatePublicOrPrivateStreamPolicy,
  type CreatePublicOrPrivateStreamPolicyT,
  CreateWebPublicStreamPolicy,
  type CreateWebPublicStreamPolicyT,
} from '../api/permissionsTypes';
import {
  getHasUserPassedWaitingPeriod,
  getCanCreatePublicStreams,
  getCanCreatePrivateStreams,
  getCanCreateWebPublicStreams,
  roleIsAtLeast,
} from '../permissionSelectors';
import rootReducer from '../boot/reducers';
import { EVENT } from '../actionConstants';
import * as eg from './lib/exampleData';
import { EventTypes } from '../api/eventTypes';
import { objectEntries } from '../flowPonyfill';

describe('roleIsAtLeast', () => {
  const { Owner, Admin, Moderator, Member, Guest } = Role;

  // Keep this current with all possible roles, from least to most privilege.
  const kRolesAscending = [Guest, Member, Moderator, Admin, Owner];
  expect(RoleValues).toIncludeSameMembers(kRolesAscending);
  expect(RoleValues).toBeArrayOfSize(kRolesAscending.length);

  objectEntries(Role).forEach(([thresholdRoleName, thresholdRole]) => {
    objectEntries(Role).forEach(([thisRoleName, thisRole]) => {
      const expected = kRolesAscending.indexOf(thisRole) >= kRolesAscending.indexOf(thresholdRole);

      const testName = expected
        ? `${thisRoleName} is at least as high as ${thresholdRoleName}`
        : `${thisRoleName} is lower than ${thresholdRoleName}`;

      const actual = roleIsAtLeast(thisRole, thresholdRole);
      test(testName, () => {
        expect(actual).toBe(expected);
      });
    });
  });
});

// TODO(?): Could deduplicate with the other getCanCreate*Streams; see
//     https://github.com/zulip/zulip-mobile/pull/5394#discussion_r883215288
describe('getCanCreatePublicStreams', () => {
  const {
    MemberOrAbove,
    AdminOrAbove,
    FullMemberOrAbove,
    ModeratorOrAbove,
  } = CreatePublicOrPrivateStreamPolicy;
  const { Owner, Admin, Moderator, Member, Guest } = Role;

  test.each`
    policy               | role         | waitingPeriodPassed | expected
    ${MemberOrAbove}     | ${Owner}     | ${undefined}        | ${true}
    ${MemberOrAbove}     | ${Admin}     | ${undefined}        | ${true}
    ${MemberOrAbove}     | ${Moderator} | ${undefined}        | ${true}
    ${MemberOrAbove}     | ${Member}    | ${undefined}        | ${true}
    ${MemberOrAbove}     | ${Guest}     | ${undefined}        | ${false}
    ${AdminOrAbove}      | ${Owner}     | ${undefined}        | ${true}
    ${AdminOrAbove}      | ${Admin}     | ${undefined}        | ${true}
    ${AdminOrAbove}      | ${Moderator} | ${undefined}        | ${false}
    ${AdminOrAbove}      | ${Member}    | ${undefined}        | ${false}
    ${AdminOrAbove}      | ${Guest}     | ${undefined}        | ${false}
    ${FullMemberOrAbove} | ${Owner}     | ${undefined}        | ${true}
    ${FullMemberOrAbove} | ${Admin}     | ${undefined}        | ${true}
    ${FullMemberOrAbove} | ${Moderator} | ${undefined}        | ${true}
    ${FullMemberOrAbove} | ${Member}    | ${true}             | ${true}
    ${FullMemberOrAbove} | ${Member}    | ${false}            | ${false}
    ${FullMemberOrAbove} | ${Guest}     | ${undefined}        | ${false}
    ${ModeratorOrAbove}  | ${Owner}     | ${undefined}        | ${true}
    ${ModeratorOrAbove}  | ${Admin}     | ${undefined}        | ${true}
    ${ModeratorOrAbove}  | ${Moderator} | ${undefined}        | ${true}
    ${ModeratorOrAbove}  | ${Member}    | ${undefined}        | ${false}
    ${ModeratorOrAbove}  | ${Guest}     | ${undefined}        | ${false}
  `(
    'returns $expected when policy is $policy; role is $role; waitingPeriodPassed is $waitingPeriodPassed',
    async ({
      policy,
      role,
      waitingPeriodPassed,
      expected,
    }: {
      policy: CreatePublicOrPrivateStreamPolicyT,
      role: RoleT,
      waitingPeriodPassed: boolean | void,
      expected: boolean,
    }) => {
      const globalState = [
        {
          type: EVENT,
          event: {
            id: 1,
            type: EventTypes.realm_user,
            op: 'update',
            person: { user_id: eg.selfUser.user_id, role },
          },
        },
        {
          type: EVENT,
          event: {
            id: 0,
            type: EventTypes.realm,
            property: 'default',
            op: 'update_dict',
            data: { create_public_stream_policy: policy },
          },
        },
      ].reduce(rootReducer, eg.plusReduxState);

      const newState = tryGetActiveAccountState(globalState);
      invariant(newState !== undefined, 'expected newState');

      if (waitingPeriodPassed !== undefined) {
        // TODO: Figure out how to jest.mock this or something instead.

        const daysToAdd =
          getRealm(newState).waitingPeriodThreshold + (waitingPeriodPassed ? 2 : -2);
        jest.setSystemTime(Date.parse(getOwnUser(newState).date_joined) + daysToAdd * 86400_000);
      }

      expect(getCanCreatePublicStreams(newState)).toBe(expected);
    },
  );
});

// TODO(?): Could deduplicate with the other getCanCreate*Streams; see
//     https://github.com/zulip/zulip-mobile/pull/5394#discussion_r883215288
describe('getCanCreatePrivateStreams', () => {
  const {
    MemberOrAbove,
    AdminOrAbove,
    FullMemberOrAbove,
    ModeratorOrAbove,
  } = CreatePublicOrPrivateStreamPolicy;
  const { Owner, Admin, Moderator, Member, Guest } = Role;

  test.each`
    policy               | role         | waitingPeriodPassed | expected
    ${MemberOrAbove}     | ${Owner}     | ${undefined}        | ${true}
    ${MemberOrAbove}     | ${Admin}     | ${undefined}        | ${true}
    ${MemberOrAbove}     | ${Moderator} | ${undefined}        | ${true}
    ${MemberOrAbove}     | ${Member}    | ${undefined}        | ${true}
    ${MemberOrAbove}     | ${Guest}     | ${undefined}        | ${false}
    ${AdminOrAbove}      | ${Owner}     | ${undefined}        | ${true}
    ${AdminOrAbove}      | ${Admin}     | ${undefined}        | ${true}
    ${AdminOrAbove}      | ${Moderator} | ${undefined}        | ${false}
    ${AdminOrAbove}      | ${Member}    | ${undefined}        | ${false}
    ${AdminOrAbove}      | ${Guest}     | ${undefined}        | ${false}
    ${FullMemberOrAbove} | ${Owner}     | ${undefined}        | ${true}
    ${FullMemberOrAbove} | ${Admin}     | ${undefined}        | ${true}
    ${FullMemberOrAbove} | ${Moderator} | ${undefined}        | ${true}
    ${FullMemberOrAbove} | ${Member}    | ${true}             | ${true}
    ${FullMemberOrAbove} | ${Member}    | ${false}            | ${false}
    ${FullMemberOrAbove} | ${Guest}     | ${undefined}        | ${false}
    ${ModeratorOrAbove}  | ${Owner}     | ${undefined}        | ${true}
    ${ModeratorOrAbove}  | ${Admin}     | ${undefined}        | ${true}
    ${ModeratorOrAbove}  | ${Moderator} | ${undefined}        | ${true}
    ${ModeratorOrAbove}  | ${Member}    | ${undefined}        | ${false}
    ${ModeratorOrAbove}  | ${Guest}     | ${undefined}        | ${false}
  `(
    'returns $expected when policy is $policy; role is $role; waitingPeriodPassed is $waitingPeriodPassed',
    async ({
      policy,
      role,
      waitingPeriodPassed,
      expected,
    }: {
      policy: CreatePublicOrPrivateStreamPolicyT,
      role: RoleT,
      waitingPeriodPassed: boolean | void,
      expected: boolean,
    }) => {
      const globalState = [
        {
          type: EVENT,
          event: {
            id: 1,
            type: EventTypes.realm_user,
            op: 'update',
            person: { user_id: eg.selfUser.user_id, role },
          },
        },
        {
          type: EVENT,
          event: {
            id: 0,
            type: EventTypes.realm,
            property: 'default',
            op: 'update_dict',
            data: { create_private_stream_policy: policy },
          },
        },
      ].reduce(rootReducer, eg.plusReduxState);

      const newState = tryGetActiveAccountState(globalState);
      invariant(newState !== undefined, 'expected newState');

      if (waitingPeriodPassed !== undefined) {
        // TODO: Figure out how to jest.mock this or something instead.

        const daysToAdd =
          getRealm(newState).waitingPeriodThreshold + (waitingPeriodPassed ? 2 : -2);
        jest.setSystemTime(Date.parse(getOwnUser(newState).date_joined) + daysToAdd * 86400_000);
      }

      expect(getCanCreatePrivateStreams(newState)).toBe(expected);
    },
  );
});

// TODO(?): Could deduplicate with the other getCanCreate*Streams; see
//     https://github.com/zulip/zulip-mobile/pull/5394#discussion_r883215288
describe('getCanCreateWebPublicStreams', () => {
  const { AdminOrAbove, ModeratorOrAbove, Nobody, OwnerOnly } = CreateWebPublicStreamPolicy;
  const { Owner, Admin, Moderator, Member, Guest } = Role;

  test('returns false when webPublicStreamsEnabled is false', () => {
    const globalState = [
      {
        type: EVENT,
        event: {
          id: 0,
          type: EventTypes.realm_user,
          op: 'update',
          person: { user_id: eg.selfUser.user_id, role: Owner },
        },
      },
    ].reduce(
      rootReducer,
      eg.reduxStatePlus({
        realm: {
          ...eg.plusReduxState.realm,
          webPublicStreamsEnabled: false,
          enableSpectatorAccess: true,
          createWebPublicStreamPolicy: ModeratorOrAbove,
        },
      }),
    );

    const state = tryGetActiveAccountState(globalState);
    invariant(state, 'expected per-account state');

    expect(getCanCreateWebPublicStreams(state)).toBeFalse();
  });

  test('returns false when enableSpectatorAccess is false', () => {
    const globalState = [
      {
        type: EVENT,
        event: {
          id: 0,
          type: EventTypes.realm_user,
          op: 'update',
          person: { user_id: eg.selfUser.user_id, role: Owner },
        },
      },
    ].reduce(
      rootReducer,
      eg.reduxStatePlus({
        realm: {
          ...eg.plusReduxState.realm,
          webPublicStreamsEnabled: true,
          enableSpectatorAccess: false,
          createWebPublicStreamPolicy: ModeratorOrAbove,
        },
      }),
    );

    const state = tryGetActiveAccountState(globalState);
    invariant(state, 'expected per-account state');

    expect(getCanCreateWebPublicStreams(state)).toBeFalse();
  });

  test.each`
    policy              | role         | expected
    ${AdminOrAbove}     | ${Owner}     | ${true}
    ${AdminOrAbove}     | ${Admin}     | ${true}
    ${AdminOrAbove}     | ${Moderator} | ${false}
    ${AdminOrAbove}     | ${Member}    | ${false}
    ${AdminOrAbove}     | ${Guest}     | ${false}
    ${ModeratorOrAbove} | ${Owner}     | ${true}
    ${ModeratorOrAbove} | ${Admin}     | ${true}
    ${ModeratorOrAbove} | ${Moderator} | ${true}
    ${ModeratorOrAbove} | ${Member}    | ${false}
    ${ModeratorOrAbove} | ${Guest}     | ${false}
    ${Nobody}           | ${Owner}     | ${false}
    ${Nobody}           | ${Admin}     | ${false}
    ${Nobody}           | ${Moderator} | ${false}
    ${Nobody}           | ${Member}    | ${false}
    ${Nobody}           | ${Guest}     | ${false}
    ${OwnerOnly}        | ${Owner}     | ${true}
    ${OwnerOnly}        | ${Admin}     | ${false}
    ${OwnerOnly}        | ${Moderator} | ${false}
    ${OwnerOnly}        | ${Member}    | ${false}
    ${OwnerOnly}        | ${Guest}     | ${false}
  `(
    'returns $expected when policy is $policy and role is $role',
    async ({
      policy,
      role,
      expected,
    }: {
      policy: CreateWebPublicStreamPolicyT,
      role: RoleT,
      expected: boolean,
    }) => {
      const globalState = [
        {
          type: EVENT,
          event: {
            id: 0,
            type: EventTypes.realm_user,
            op: 'update',
            person: { user_id: eg.selfUser.user_id, role },
          },
        },
      ].reduce(
        rootReducer,
        eg.reduxStatePlus({
          realm: {
            ...eg.plusReduxState.realm,
            webPublicStreamsEnabled: true,
            enableSpectatorAccess: true,
            createWebPublicStreamPolicy: policy,
          },
        }),
      );

      const state = tryGetActiveAccountState(globalState);
      invariant(state, 'expected per-account state');

      expect(getCanCreateWebPublicStreams(state)).toBe(expected);
    },
  );
});

describe('getHasUserPassedWaitingPeriod', () => {
  test.each`
    dateJoined                | currentDate               | threshold | expected
    ${new Date('2000-01-01')} | ${new Date('2000-01-10')} | ${10}     | ${false}
    ${new Date('2000-01-01')} | ${new Date('2000-01-11')} | ${10}     | ${true}
    ${new Date('2000-01-01')} | ${new Date('2000-01-12')} | ${10}     | ${true}
    ${new Date('2000-01-01')} | ${new Date('2000-03-30')} | ${90}     | ${false}
    ${new Date('2000-01-01')} | ${new Date('2000-03-31')} | ${90}     | ${true}
    ${new Date('2000-01-01')} | ${new Date('2000-04-01')} | ${90}     | ${true}
  `(
    'returns $expected for dateJoined: $dateJoined; currentDate: $currentDate; threshold: $threshold',
    async (args: {|
      dateJoined: Date,
      currentDate: Date,
      threshold: number,
      expected: boolean,
    |}) => {
      const { dateJoined, currentDate, threshold, expected } = args;

      const globalState = [
        {
          type: EVENT,
          event: {
            id: 0,
            type: EventTypes.realm,
            op: 'update_dict',
            property: 'default',
            data: { waiting_period_threshold: threshold },
          },
        },
      ].reduce(
        rootReducer,
        eg.reduxStatePlus({
          users: eg.plusReduxState.users.map(u =>
            u.user_id === eg.selfUser.user_id ? { ...u, date_joined: dateJoined.toString() } : u,
          ),
        }),
      );

      jest.setSystemTime(currentDate);

      const newState = tryGetActiveAccountState(globalState);
      expect(newState).toBeTruthy();

      expect(newState && getHasUserPassedWaitingPeriod(newState, eg.selfUser.user_id)).toBe(
        expected,
      );
    },
  );
});
