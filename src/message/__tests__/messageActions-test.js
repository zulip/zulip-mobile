/* @flow strict-local */
import configureStore from 'redux-mock-store';
// $FlowFixMe[untyped-import]
import thunk from 'redux-thunk';

import { combinedThunkExtras } from '../../boot/store';
import { navigateToChat } from '../../nav/navActions';
import * as NavigationService from '../../nav/NavigationService';
import { messageLinkPress, doNarrow } from '../messagesActions';
import { streamNarrow, topicNarrow, pmNarrowFromUsersUnsafe } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';
import type { GlobalState } from '../../reduxTypes';
import type { Action } from '../../actionTypes';
import type { Stream, User } from '../../types';
import { mock_ } from '../../__tests__/lib/intl';
import * as logging from '../../utils/logging';

const mockStore = configureStore([thunk.withExtraArgument(combinedThunkExtras)]);

const streamNarrowObj = streamNarrow(eg.stream.stream_id);

describe('messageActions', () => {
  describe('messageLinkPress', () => {
    beforeAll(() => {
      // suppress `logging.info` output
      // $FlowFixMe[prop-missing]: Jest mock
      logging.info.mockReturnValue();
    });

    function prepare(args: {| streams?: Stream[], users?: User[] |} = Object.freeze({})) {
      const { streams = [], users = [] } = args;
      return {
        store: mockStore<GlobalState, Action>(
          eg.reduxStatePlus({
            session: { ...eg.plusReduxState.session, isHydrated: true },
            streams: [...eg.plusReduxState.streams, ...streams],
            users: [...eg.plusReduxState.users, ...users],
          }),
        ),
      };
    }

    /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "checkLink"] }] */
    async function checkLink(store, link, expectedNarrow) {
      // $FlowFixMe[cannot-write]  Teach Flow about mocking
      NavigationService.dispatch = jest.fn();

      const action = messageLinkPress(link, mock_);
      await store.dispatch(action);

      expect(NavigationService.dispatch).toHaveBeenCalledWith(navigateToChat(expectedNarrow));

      // $FlowFixMe[prop-missing] Teach Flow about mocking
      NavigationService.dispatch.mockReset();
    }

    test('handles /near/ links', async () => {
      const stream = eg.makeStream({ stream_id: 1, name: 'test' });
      const user1 = eg.makeUser({ user_id: 1, full_name: 'user 1' });
      const user2 = eg.makeUser({ user_id: 2, full_name: 'user 2' });
      const { store } = prepare({ streams: [stream], users: [user1, user2] });

      await checkLink(store, '#narrow/stream/1-test/topic/hello/near/1', topicNarrow(1, 'hello'));
      await checkLink(store, '#narrow/dm/1-user-1/near/1', pmNarrowFromUsersUnsafe([user1]));
      await checkLink(
        store,
        '#narrow/dm/1,2-group/near/1',
        pmNarrowFromUsersUnsafe([user1, user2]),
      );
    });
  });

  describe('doNarrow', () => {
    test('action to push to nav dispatched', () => {
      // $FlowFixMe[cannot-write]
      NavigationService.dispatch = jest.fn();

      const store = mockStore<GlobalState, Action>(
        eg.reduxState({
          accounts: [eg.selfAccount],
          session: { ...eg.baseReduxState.session, isHydrated: true },
          streams: [eg.stream],
        }),
      );

      store.dispatch(doNarrow(streamNarrowObj));

      expect(NavigationService.dispatch).toHaveBeenCalledWith(navigateToChat(streamNarrowObj));
    });
  });
});
