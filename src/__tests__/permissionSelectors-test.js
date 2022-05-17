/* @flow strict-local */
import invariant from 'invariant';

import { tryGetActiveAccountState } from '../selectors';
import {
  Role,
  type RoleT,
  CreateWebPublicStreamPolicy,
  type CreateWebPublicStreamPolicyT,
} from '../api/permissionsTypes';
import { getCanCreateWebPublicStreams } from '../permissionSelectors';
import rootReducer from '../boot/reducers';
import { EVENT } from '../actionConstants';
import * as eg from './lib/exampleData';
import { EventTypes } from '../api/eventTypes';

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
