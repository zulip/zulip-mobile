import deepFreeze from 'deep-freeze';

import { ACCOUNT_SWITCH } from '../../actionConstants';
import userGroupsReducers from '../userGroupsReducers';

describe('userGroupsReducers', () => {
  test('handles unknown action and no state by returning initial state', () => {
    const initialState = undefined;

    const action = deepFreeze({});

    const newState = userGroupsReducers(initialState, action);
    expect(newState).toBeDefined();
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

      const actualState = userGroupsReducers(initialState, action);

      expect(actualState).toEqual(expectedState);
    });
  });
});
