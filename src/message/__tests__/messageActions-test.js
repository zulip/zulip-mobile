import mockStore from 'redux-mock-store'; // eslint-disable-line

import { doNarrow } from '../messagesActions';
import { streamNarrow, homeNarrow } from '../../utils/narrow';

const narrow = streamNarrow('some stream');
const streamNarrowStr = JSON.stringify(narrow);

describe('messageActions', () => {
  describe('doNarrow', () => {
    test('when no messages in new narrow and caughtUp is false, actions to fetch messages and switch narrow are dispatched', () => {
      const store = mockStore({
        caughtUp: {
          [streamNarrowStr]: {
            newer: false,
            older: true,
          },
        },
        chat: {
          narrow: homeNarrow,
          messages: {},
        },
      });

      store.dispatch(doNarrow(narrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when no messages in new narrow and caughtUp is true, only action to switch narrow is dispatched', () => {
      const store = mockStore({
        caughtUp: {
          [streamNarrowStr]: {
            newer: true,
            older: true,
          },
        },
        chat: {
          narrow: homeNarrow,
          messages: {},
        },
      });

      store.dispatch(doNarrow(narrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when messages in new narrow, only action to switch narrow is dispatched', () => {
      const store = mockStore({
        caughtUp: {},
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 1 }],
          },
        },
      });

      store.dispatch(doNarrow(narrow));
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
