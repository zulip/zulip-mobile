import mockStore from 'redux-mock-store'; // eslint-disable-line

import { doNarrow } from '../messagesActions';
import { streamNarrow, homeNarrow, privateNarrow } from '../../utils/narrow';

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
        streams: [
          {
            name: 'some stream',
          },
        ],
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
        streams: [
          {
            name: 'some stream',
          },
        ],
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
        streams: [
          {
            name: 'some stream',
          },
        ],
      });

      store.dispatch(doNarrow(narrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('if newNarrow stream is not valid, do nothing', () => {
      const store = mockStore({
        caughtUp: {},
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 1 }],
          },
        },
        streams: [
          {
            name: 'some updated stream',
          },
        ],
      });

      store.dispatch(doNarrow(narrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('if newNarrow user is deactivated, do nothing', () => {
      const store = mockStore({
        caughtUp: {},
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 1 }],
          },
        },
        users: [
          {
            email: 'ab@a.com',
          },
        ],
      });

      store.dispatch(doNarrow(privateNarrow('a@a.com')));
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
