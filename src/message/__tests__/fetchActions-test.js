import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { fetchMessages, fetchOlder, fetchNewer } from '../fetchActions';
import { streamNarrow, HOME_NARROW, HOME_NARROW_STR } from '../../utils/narrow';
import { navStateWithNarrow } from '../../utils/testHelpers';
import * as eg from '../../__tests__/lib/exampleData';

const mockStore = configureStore([thunk]);

const narrow = streamNarrow('some stream');
const streamNarrowStr = JSON.stringify(narrow);

global.FormData = class FormData {};

describe('fetchActions', () => {
  afterEach(() => {
    fetch.reset();
  });

  describe('fetchMessages', () => {
    test('message fetch success action is dispatched after successful fetch', async () => {
      const message1 = eg.streamMessage({ id: 1 });

      const store = mockStore(
        eg.reduxState({
          ...navStateWithNarrow(HOME_NARROW),
          accounts: [eg.makeAccount()],
          narrows: {
            [streamNarrowStr]: [message1.id],
          },
        }),
      );

      const response = {
        messages: [message1, eg.streamMessage({ id: 2 }), eg.streamMessage({ id: 3 })],
        result: 'success',
      };
      fetch.mockResponseSuccess(JSON.stringify(response));

      await store.dispatch(fetchMessages(HOME_NARROW, 0, 1, 1));
      const actions = store.getActions();

      expect(actions).toHaveLength(2);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
      expect(actions[1].type).toBe('MESSAGE_FETCH_COMPLETE');
    });

    const BORING_RESPONSE = JSON.stringify({
      messages: [],
      result: 'success',
    });

    test('when messages to be fetched both before and after anchor, numBefore and numAfter are greater than zero', () => {
      const store = mockStore(
        eg.reduxState({
          ...navStateWithNarrow(HOME_NARROW),
          accounts: [eg.makeAccount()],
          narrows: {
            [streamNarrowStr]: [1],
          },
        }),
      );

      fetch.mockResponseSuccess(BORING_RESPONSE);

      store.dispatch(fetchMessages(HOME_NARROW, 0, 1, 1));
      const actions = store.getActions();

      expect(actions.length).toBeGreaterThanOrEqual(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
      expect(actions[0].numBefore).toBeGreaterThan(0);
      expect(actions[0].numAfter).toBeGreaterThan(0);
    });

    test('when no messages to be fetched before the anchor, numBefore is not greater than zero', () => {
      const store = mockStore(
        eg.reduxState({
          ...navStateWithNarrow(HOME_NARROW),
          accounts: [eg.makeAccount()],
          narrows: {
            [streamNarrowStr]: [1],
          },
        }),
      );

      fetch.mockResponseSuccess(BORING_RESPONSE);

      store.dispatch(fetchMessages(HOME_NARROW, 0, -1, 1));
      const actions = store.getActions();

      expect(actions.length).toBeGreaterThanOrEqual(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
      expect(actions[0].numBefore).not.toBeGreaterThan(0);
    });

    test('when no messages to be fetched after the anchor, numAfter is not greater than zero', () => {
      const store = mockStore(
        eg.reduxState({
          ...navStateWithNarrow(HOME_NARROW),
          accounts: [eg.makeAccount()],
          narrows: {
            [streamNarrowStr]: [1],
          },
        }),
      );

      fetch.mockResponseSuccess(BORING_RESPONSE);

      store.dispatch(fetchMessages(HOME_NARROW, 0, 1, -1));
      const actions = store.getActions();

      expect(actions.length).toBeGreaterThanOrEqual(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
      expect(actions[0].numAfter).not.toBeGreaterThan(0);
    });
  });

  describe('fetchOlder', () => {
    const baseState = eg.reduxState({
      ...navStateWithNarrow(HOME_NARROW),
      narrows: {
        ...eg.baseReduxState.narrows,
        [streamNarrowStr]: [2],
        [HOME_NARROW_STR]: [1, 2],
      },
      messages: {
        ...eg.baseReduxState.messages,
        '1': eg.streamMessage({ id: 1 }),
        '2': eg.streamMessage({ id: 2 }),
      },
    });

    test('message fetch start action is dispatched with numBefore greater than zero', () => {
      const store = mockStore({
        ...baseState,
        fetching: {
          ...baseState.fetching,
          [HOME_NARROW_STR]: {
            older: false,
            newer: false,
          },
        },
      });

      store.dispatch(fetchOlder(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
      expect(actions[0].numBefore).toBeGreaterThan(0);
    });

    test('when caughtUp older is true, no action is dispatched', () => {
      const store = mockStore({
        ...baseState,
        caughtUp: {
          ...baseState.caughtUp,
          [HOME_NARROW_STR]: {
            older: true,
            newer: true,
          },
        },
      });

      store.dispatch(fetchOlder(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('when fetchingOlder older is true, no action is dispatched', () => {
      const store = mockStore({
        ...baseState,
        fetching: {
          ...baseState.fetching,
          [HOME_NARROW_STR]: {
            older: true,
            newer: true,
          },
        },
      });

      store.dispatch(fetchOlder(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('when needsInitialFetch is true, no action is dispatched', () => {
      const store = mockStore({
        ...baseState,
        session: {
          ...baseState.session,
          needsInitialFetch: true,
        },
      });

      store.dispatch(fetchOlder(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });
  });

  describe('fetchNewer', () => {
    const baseState = eg.reduxState({
      ...navStateWithNarrow(HOME_NARROW),
      narrows: {
        ...eg.baseReduxState.narrows,
        [streamNarrowStr]: [2],
        [HOME_NARROW_STR]: [1, 2],
      },
      messages: {
        ...eg.baseReduxState.messages,
        '1': eg.streamMessage({ id: 1 }),
        '2': eg.streamMessage({ id: 2 }),
      },
    });

    test('message fetch start action is dispatched with numAfter greater than zero', () => {
      const store = mockStore({
        ...baseState,
        fetching: {
          ...baseState.fetching,
          [HOME_NARROW_STR]: {
            older: false,
            newer: false,
          },
        },
      });

      store.dispatch(fetchNewer(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
      expect(actions[0].numAfter).toBeGreaterThan(0);
    });

    test('when caughtUp newer is true, no action is dispatched', () => {
      const store = mockStore({
        ...baseState,
        caughtUp: {
          ...baseState.caughtUp,
          [HOME_NARROW_STR]: {
            older: true,
            newer: true,
          },
        },
      });

      store.dispatch(fetchNewer(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('when fetching.newer is true, no action is dispatched', () => {
      const store = mockStore({
        ...baseState,
        fetching: {
          ...baseState.fetching,
          [HOME_NARROW_STR]: {
            older: false,
            newer: true,
          },
        },
      });

      store.dispatch(fetchNewer(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('when needsInitialFetch is true, no action is dispatched', () => {
      const store = mockStore({
        ...baseState,
        session: {
          ...baseState.session,
          needsInitialFetch: true,
        },
      });

      store.dispatch(fetchNewer(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });
  });
});
