import deepFreeze from 'deep-freeze';

import {
  REGISTER_COMPLETE,
  ACCOUNT_SWITCH,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
} from '../../actionConstants';
import userGroupsReducer from '../userGroupsReducer';

describe('userGroupsReducer', () => {
  test('handles unknown action and no state by returning initial state', () => {
    const initialState = undefined;

    const action = deepFreeze({});

    const newState = userGroupsReducer(initialState, action);
    expect(newState).toBeDefined();
  });

  describe('REGISTER_COMPLETE', () => {
    test('when data is provided init state with it', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {
          realm_user_groups: [
            {
              id: 1,
              name: 'Some user group',
              members: [],
            },
          ],
        },
      });

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual([
        {
          id: 1,
          name: 'Some user group',
          members: [],
        },
      ]);
    });

    test('when no data is given reset state', () => {
      const initialState = deepFreeze([['stream'], ['topic']]);
      const action = deepFreeze({
        type: REGISTER_COMPLETE,
        data: {},
      });
      const expectedState = [];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('ACCOUNT_SWITCH', () => {
    test('resets state to initial state', () => {
      const initialState = deepFreeze([
        {
          id: 1,
          name: 'Some Group',
          description: 'This is some group',
          members: [],
        },
      ]);

      const action = deepFreeze({
        type: ACCOUNT_SWITCH,
      });

      const expectedState = [];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_ADD', () => {
    test('adds a user group to the state', () => {
      const initialState = deepFreeze([]);
      const group = {
        id: 1,
        name: 'Some Group',
        description: 'This is some group',
        members: [123],
      };
      const action = deepFreeze({
        type: EVENT_USER_GROUP_ADD,
        op: 'add',
        group,
      });

      const expectedState = [group];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_REMOVE', () => {
    test('if user group does not exist state does not change', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: EVENT_USER_GROUP_REMOVE,
        op: 'remove',
        group_id: 1,
      });
      const expectedState = [];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('adds a user group to the state', () => {
      const initialState = deepFreeze([
        {
          id: 1,
          name: 'Some group',
        },
        {
          id: 2,
          name: 'Another group',
        },
      ]);
      const action = deepFreeze({
        type: EVENT_USER_GROUP_REMOVE,
        op: 'remove',
        group_id: 1,
      });

      const expectedState = [
        {
          id: 2,
          name: 'Another group',
        },
      ];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_UPDATE', () => {
    test('if user group does not exist state does not change', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: EVENT_USER_GROUP_UPDATE,
        op: 'update',
        group_id: 1,
        data: { name: 'Some name' },
      });
      const expectedState = [];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('updates an existing user group with supplied new values', () => {
      const initialState = deepFreeze([
        {
          id: 1,
          name: 'Some group',
        },
        {
          id: 2,
          name: 'Another group',
        },
      ]);
      const action = deepFreeze({
        type: EVENT_USER_GROUP_UPDATE,
        op: 'update',
        group_id: 2,
        data: { name: 'New name' },
      });
      const expectedState = [
        {
          id: 1,
          name: 'Some group',
        },
        {
          id: 2,
          name: 'New name',
        },
      ];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_ADD_MEMBERS', () => {
    test('if user group does not exist state does not change', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: EVENT_USER_GROUP_ADD_MEMBERS,
        op: 'add_members',
        group_id: 1,
        user_ids: [1, 2, 3],
      });
      const expectedState = [];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('updates an existing user group with supplied new members', () => {
      const initialState = deepFreeze([
        {
          id: 1,
          name: 'Some group',
          members: [1],
        },
      ]);
      const action = deepFreeze({
        type: EVENT_USER_GROUP_ADD_MEMBERS,
        op: 'add_members',
        group_id: 1,
        user_ids: [2, 3],
      });
      const expectedState = [
        {
          id: 1,
          name: 'Some group',
          members: [1, 2, 3],
        },
      ];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });

  describe('EVENT_USER_GROUP_REMOVE_MEMBERS', () => {
    test('if user group does not exist state does not change', () => {
      const initialState = deepFreeze([]);
      const action = deepFreeze({
        type: EVENT_USER_GROUP_REMOVE_MEMBERS,
        op: 'remove_members',
        group_id: 1,
        user_ids: [1],
      });
      const expectedState = [];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });

    test('removes members from an existing user group', () => {
      const initialState = deepFreeze([
        {
          id: 1,
          name: 'Some group',
          members: [1, 2, 3, 4],
        },
        {
          id: 2,
          name: 'Another group',
          members: [1, 2, 3, 4],
        },
      ]);
      const action = deepFreeze({
        type: EVENT_USER_GROUP_REMOVE_MEMBERS,
        op: 'remove_members',
        group_id: 1,
        user_ids: [2, 3],
      });
      const expectedState = [
        {
          id: 1,
          name: 'Some group',
          members: [1, 4],
        },
        {
          id: 2,
          name: 'Another group',
          members: [1, 2, 3, 4],
        },
      ];

      const actualState = userGroupsReducer(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
