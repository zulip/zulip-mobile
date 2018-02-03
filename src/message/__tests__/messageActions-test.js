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
      const actions = store.getActions();

      expect(actions.length).toBe(2);
      expect(actions[0].type).toBe('SWITCH_NARROW');
      expect(actions[1].type).toBe('MESSAGE_FETCH_START');
      expect(actions[1].narrow).toEqual([
        {
          operand: 'some stream',
          operator: 'stream',
        },
      ]);
    });

    test('when no messages in new narrow but caught up, only switch to narrow, do not fetch', () => {
      const store = mockStore({
        caughtUp: {
          [streamNarrowStr]: {
            newer: true,
            older: true,
          },
        },
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [],
          },
        },
        streams: [
          {
            name: 'some stream',
          },
        ],
      });

      store.dispatch(doNarrow(narrow));
      const actions = store.getActions();

      expect(actions).toEqual([
        {
          narrow: [
            {
              operand: 'some stream',
              operator: 'stream',
            },
          ],
          type: 'SWITCH_NARROW',
        },
      ]);
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
      const actions = store.getActions();

      expect(actions.length).toEqual(1);
      expect(actions[0].type).toEqual('SWITCH_NARROW');
    });

    test('if new narrow stream is not valid, do nothing', () => {
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
      const actions = store.getActions();

      expect(actions.length).toBe(0);
    });

    test('if new narrow user is deactivated, do nothing', () => {
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
      const actions = store.getActions();

      expect(actions.length).toBe(0);
    });
  });
});
