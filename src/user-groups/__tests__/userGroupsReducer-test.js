/* @flow strict-local */

import deepFreeze from 'deep-freeze';

import * as eg from '../../__tests__/lib/exampleData';
import {
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
} from '../../actionConstants';
import userGroupsReducer from '../userGroupsReducer';

describe('userGroupsReducer', () => {
  describe('REGISTER_COMPLETE', () => {
    test('when data is provided init state with it', () => {
      const group = eg.makeUserGroup();

      const prevState = deepFreeze(eg.plusReduxState.userGroups);

      const action = eg.mkActionRegisterComplete({ realm_user_groups: [group] });

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual([group]);
    });

    // TODO(#5102): Remove this test case, which is for pre-1.8 servers.
    test('when no data is given reset state', () => {
      const prevState = deepFreeze([eg.makeUserGroup()]);
      const action = eg.mkActionRegisterComplete({
        // Hmm, we should need a Flow suppression here. This property is
        // marked required in InitialData, and this explicit undefined is
        // meant to defy that; see TODO(#5102) above.
        // mkActionRegisterComplete is designed to accept input with this or
        // any property *omitted*… and I think, as a side effect of handling
        // that, Flow mistakenly accepts an explicit undefined here, so it
        // doesn't catch the resulting malformed InitialData.
        realm_user_groups: undefined,
      });
      const expectedState = [];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const prevState = deepFreeze([eg.makeUserGroup()]);

      const action = eg.action.account_switch;

      const expectedState = [];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_ADD', () => {
    test('adds a user group to the state', () => {
      const prevState = deepFreeze([]);
      const group = eg.makeUserGroup();
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_ADD,
        op: 'add',
        group,
      });

      const expectedState = [group];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_REMOVE', () => {
    test('if user group does not exist state does not change', () => {
      const prevState = deepFreeze([]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_REMOVE,
        op: 'remove',
        group_id: 1,
      });
      const expectedState = [];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds a user group to the state', () => {
      const group1 = eg.makeUserGroup();
      const group2 = eg.makeUserGroup();

      const prevState = deepFreeze([group1, group2]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_REMOVE,
        op: 'remove',
        group_id: group1.id,
      });

      const expectedState = [group2];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_UPDATE', () => {
    test('if user group does not exist state does not change', () => {
      const prevState = deepFreeze([]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_UPDATE,
        op: 'update',
        group_id: 1,
        data: { name: 'Some name' },
      });
      const expectedState = [];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('updates an existing user group with supplied new values', () => {
      const group1 = eg.makeUserGroup();
      const group2 = eg.makeUserGroup();

      const prevState = deepFreeze([group1, group2]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_UPDATE,
        op: 'update',
        group_id: group2.id,
        data: { name: 'New name' },
      });
      const expectedState = [group1, { ...group2, name: 'New name' }];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_ADD_MEMBERS', () => {
    test('if user group does not exist state does not change', () => {
      const prevState = deepFreeze([]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_ADD_MEMBERS,
        op: 'add_members',
        group_id: 1,
        user_ids: [eg.makeUser().user_id, eg.makeUser().user_id, eg.makeUser().user_id],
      });
      const expectedState = [];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('updates an existing user group with supplied new members', () => {
      const group = eg.makeUserGroup({ members: [eg.selfUser.user_id] });
      const prevState = deepFreeze([group]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_ADD_MEMBERS,
        op: 'add_members',
        group_id: group.id,
        user_ids: [eg.otherUser.user_id, eg.thirdUser.user_id],
      });
      const expectedState = [
        { ...group, members: [eg.selfUser.user_id, eg.otherUser.user_id, eg.thirdUser.user_id] },
      ];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_REMOVE_MEMBERS', () => {
    test('if user group does not exist state does not change', () => {
      const prevState = deepFreeze([]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_REMOVE_MEMBERS,
        op: 'remove_members',
        group_id: 1,
        user_ids: [eg.makeUser().user_id],
      });
      const expectedState = [];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('removes members from an existing user group', () => {
      const user1 = eg.makeUser();
      const user2 = eg.makeUser();
      const user3 = eg.makeUser();
      const user4 = eg.makeUser();

      const group1 = eg.makeUserGroup({
        members: [user1.user_id, user2.user_id, user3.user_id, user4.user_id],
      });
      const group2 = eg.makeUserGroup({
        members: [user1.user_id, user2.user_id, user3.user_id, user4.user_id],
      });

      const prevState = deepFreeze([group1, group2]);
      const action = deepFreeze({
        id: 1,
        type: EVENT_USER_GROUP_REMOVE_MEMBERS,
        op: 'remove_members',
        group_id: group1.id,
        user_ids: [user2.user_id, user3.user_id],
      });
      const expectedState = [{ ...group1, members: [user1.user_id, user4.user_id] }, group2];

      const actualState = userGroupsReducer(prevState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
