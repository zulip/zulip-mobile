/* @flow strict-local */
import configureStore from 'redux-mock-store';
// $FlowFixMe[untyped-import]
import thunk from 'redux-thunk';

import { navigateToChat } from '../../nav/navActions';
import * as NavigationService from '../../nav/NavigationService';
import { doNarrow } from '../messagesActions';
import { streamNarrow } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';
import type { GlobalState } from '../../reduxTypes';
import type { Action } from '../../actionTypes';

const mockStore = configureStore([thunk]);

const streamNarrowObj = streamNarrow('some stream');

describe('messageActions', () => {
  describe('doNarrow', () => {
    test('action to push to nav dispatched', () => {
      // $FlowFixMe[cannot-write]
      NavigationService.dispatch = jest.fn();

      const store = mockStore<GlobalState, Action>(
        eg.reduxState({
          accounts: [eg.selfAccount],
          session: { ...eg.baseReduxState.session, isHydrated: true },
          streams: [eg.makeStream({ name: 'some stream' })],
        }),
      );

      store.dispatch(doNarrow(streamNarrowObj));

      expect(NavigationService.dispatch).toHaveBeenCalledWith(navigateToChat(streamNarrowObj));
    });
  });
});
