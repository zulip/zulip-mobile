import mockStore from 'redux-mock-store'; // eslint-disable-line

import { doNarrow } from '../messagesActions';
import { streamNarrow, homeNarrow, privateNarrow } from '../../utils/narrow';
import { navStateWithNarrow } from '../../utils/testHelpers';

const streamNarrowObj = streamNarrow('some stream');
const streamNarrowStr = JSON.stringify(streamNarrowObj);

describe('messageActions', () => {
  describe('doNarrow', () => {
    test('when no messages in new narrow and caughtUp is false, actions to fetch messages and switch narrow are dispatched', () => {
      const store = mockStore({
        realm: {},
        session: { isHydrated: true },
        caughtUp: {
          [streamNarrowStr]: {
            newer: false,
            older: true,
          },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {},
        streams: [
          {
            name: 'some stream',
          },
        ],
      });

      store.dispatch(doNarrow(streamNarrowObj));
      const actions = store.getActions();

      expect(actions.length).toBe(2);
      expect(actions[0].type).toBe('SWITCH_NARROW');
      expect(actions[1].type).toBe('MESSAGE_FETCH_START');
      expect(actions[1].narrow).toEqual(streamNarrowObj);
    });

    test('when no messages in new narrow but caught up, only switch to narrow, do not fetch', () => {
      const store = mockStore({
        realm: {},
        session: { isHydrated: true },
        caughtUp: {
          [streamNarrowStr]: {
            newer: true,
            older: true,
          },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [],
        },
        streams: [
          {
            name: 'some stream',
          },
        ],
      });

      store.dispatch(doNarrow(streamNarrowObj));
      const actions = store.getActions();

      expect(actions).toEqual([
        {
          type: 'SWITCH_NARROW',
          narrow: streamNarrowObj,
        },
      ]);
    });

    test('when messages in new narrow are too few and not caught up, fetch more messages', () => {
      const store = mockStore({
        realm: {},
        session: { isHydrated: true },
        caughtUp: {},
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 1 }],
        },
        streams: [
          {
            name: 'some stream',
          },
        ],
      });

      store.dispatch(doNarrow(streamNarrowObj));
      const actions = store.getActions();

      expect(actions.length).toBe(2);
      expect(actions[0].type).toBe('SWITCH_NARROW');
      expect(actions[1].type).toBe('MESSAGE_FETCH_START');
      expect(actions[1].narrow).toEqual(streamNarrowObj);
    });

    test('if new narrow stream is not valid, do nothing', () => {
      const store = mockStore({
        realm: {},
        session: { isHydrated: true },
        caughtUp: {},
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 1 }],
        },
        streams: [
          {
            name: 'some updated stream',
          },
        ],
      });

      store.dispatch(doNarrow(streamNarrowObj));
      const actions = store.getActions();

      expect(actions.length).toBe(0);
    });

    test('if new narrow user is deactivated, do nothing', () => {
      const store = mockStore({
        realm: {
          crossRealmBots: [],
          nonActiveUsers: [],
        },
        session: { isHydrated: true },
        caughtUp: {},
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 1 }],
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
