/* @flow strict-local */
import invariant from 'invariant';

import { tryGetActiveAccountState } from '../selectors';
import {
  Role,
  RoleValues,
  type RoleT,
  CreateWebPublicStreamPolicy,
  type CreateWebPublicStreamPolicyT,
} from '../api/permissionsTypes';
import {
  getHasUserPassedWaitingPeriod,
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
