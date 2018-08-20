import mockStore from 'redux-mock-store'; // eslint-disable-line

import { doNarrow } from '../messagesActions';
import { streamNarrow, HOME_NARROW, privateNarrow } from '../../utils/narrow';
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
        ...navStateWithNarrow(HOME_NARROW),
        messages: {},
        streams: [
          {
            name: 'some stream',
          },
        ],
      });

      store.dispatch(doNarrow(streamNarrowObj));
      const actions = store.getActions();

      expect(actions).toHaveLength(3);
      expect(actions[0].type).toBe('FETCH_STATE_RESET');
      expect(actions[1].type).toBe('Navigation/NAVIGATE');
      expect(actions[2].type).toBe('MESSAGE_FETCH_START');
      expect(actions[2].narrow).toEqual(streamNarrowObj);
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
        ...navStateWithNarrow(HOME_NARROW),
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
        { type: 'FETCH_STATE_RESET' },
        {
          type: 'Navigation/NAVIGATE',
          routeName: 'chat',
          params: { narrow: streamNarrowObj },
        },
      ]);
    });

    test('when messages in new narrow are too few and not caught up, fetch more messages', () => {
      const store = mockStore({
        realm: {},
        session: { isHydrated: true },
        caughtUp: {},
        ...navStateWithNarrow(HOME_NARROW),
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

      expect(actions).toHaveLength(3);
      expect(actions[0].type).toBe('FETCH_STATE_RESET');
      expect(actions[1].type).toBe('Navigation/NAVIGATE');
      expect(actions[2].type).toBe('MESSAGE_FETCH_START');
      expect(actions[2].narrow).toEqual(streamNarrowObj);
    });

    test('if new narrow stream is not valid, do nothing', () => {
      const store = mockStore({
        realm: {},
        session: { isHydrated: true },
        caughtUp: {},
        ...navStateWithNarrow(HOME_NARROW),
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

      expect(actions).toHaveLength(0);
    });

    test('if new narrow user is deactivated, do nothing', () => {
      const store = mockStore({
        realm: {
          nonActiveUsers: [],
        },
        session: { isHydrated: true },
        caughtUp: {},
        ...navStateWithNarrow(HOME_NARROW),
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

      expect(actions).toHaveLength(0);
    });
  });
});
