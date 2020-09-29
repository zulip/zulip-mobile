/* @flow strict-local */
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { doNarrow } from '../messagesActions';
import { streamNarrow, HOME_NARROW, privateNarrow } from '../../utils/narrow';
import { navStateWithNarrow } from '../../utils/testHelpers';
import * as eg from '../../__tests__/lib/exampleData';
import type { GlobalState } from '../../reduxTypes';
import type { Action } from '../../actionTypes';

const mockStore = configureStore([thunk]);

const streamNarrowObj = streamNarrow('some stream');
const streamNarrowStr = JSON.stringify(streamNarrowObj);

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

    test('if new narrow stream is not valid, do nothing', () => {
      const store = mockStore<GlobalState, Action>(
        eg.reduxState({
          session: { ...eg.baseReduxState.session, isHydrated: true },
          caughtUp: {},
          ...navStateWithNarrow(HOME_NARROW),
          narrows: {
            [streamNarrowStr]: [1],
          },
          messages: {
            [1]: eg.streamMessage({ id: 1 }) /* eslint-disable-line no-useless-computed-key */,
          },
          streams: [eg.makeStream({ name: 'some updated stream' })],
        }),
      );

      store.dispatch(doNarrow(streamNarrowObj));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('if new narrow user is deactivated, do nothing', () => {
      const inactiveUser = eg.makeUser({ name: 'inactive', is_active: false });

      const store = mockStore(
        eg.reduxState({
          realm: eg.realmState({
            crossRealmBots: [],
            nonActiveUsers: [], // TODO: Shouldn't `inactiveUser` go here?
          }),
          session: { ...eg.baseReduxState.session, isHydrated: true },
          caughtUp: {},
          ...navStateWithNarrow(HOME_NARROW),
          narrows: {
            [streamNarrowStr]: [1],
          },
          messages: {
            [1]: eg.streamMessage({ id: 1 }) /* eslint-disable-line no-useless-computed-key */,
          },
          users: [eg.makeUser({ name: 'bob', is_active: true })],
        }),
      );

      store.dispatch(doNarrow(privateNarrow(inactiveUser.email)));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });
  });
});
