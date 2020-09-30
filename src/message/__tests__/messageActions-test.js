/* @flow strict-local */
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { doNarrow } from '../messagesActions';
import { streamNarrow, HOME_NARROW } from '../../utils/narrow';
import { navStateWithNarrow } from '../../utils/testHelpers';
import * as eg from '../../__tests__/lib/exampleData';
import type { GlobalState } from '../../reduxTypes';
import type { Action } from '../../actionTypes';

const mockStore = configureStore([thunk]);

const streamNarrowObj = streamNarrow('some stream');

describe('messageActions', () => {
  describe('doNarrow', () => {
    test('action to push to nav dispatched', () => {
      const store = mockStore<GlobalState, Action>(
        eg.reduxState({
          accounts: [eg.selfAccount],
          session: { ...eg.baseReduxState.session, isHydrated: true },
          ...navStateWithNarrow(HOME_NARROW),
          streams: [eg.makeStream({ name: 'some stream' })],
        }),
      );

      store.dispatch(doNarrow(streamNarrowObj));
      const actions = store.getActions();

      expect(actions).toHaveLength(1);
      const [action0] = actions;
      expect(action0.type).toBe('Navigation/PUSH');
    });
  });
});
