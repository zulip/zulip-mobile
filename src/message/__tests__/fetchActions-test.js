import mockStore from 'redux-mock-store'; // eslint-disable-line

import {
  backgroundFetchMessages,
  fetchMessages,
  fetchMessagesAtFirstUnread,
  fetchOlder,
  fetchNewer,
} from '../fetchActions';
import { streamNarrow, homeNarrow, homeNarrowStr } from '../../utils/narrow';
import { navStateWithNarrow } from '../../utils/testHelpers';

const narrow = streamNarrow('some stream');
const streamNarrowStr = JSON.stringify(narrow);

global.FormData = class FormData {};

describe('fetchActions', () => {
  afterEach(() => {
    fetch.reset();
  });

  describe('backgroundFetchMessages', () => {
    test('message fetch success action is dispatched after successful fetch', async () => {
      const store = mockStore({
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 1 }],
        },
      });
      const response = { messages: [{ id: 1 }, { id: 2 }, { id: 3 }], result: 'success' };
      fetch.mockResponseSuccess(JSON.stringify(response));

      await store.dispatch(backgroundFetchMessages(homeNarrow, 0, 1, 1, true));
      const actions = store.getActions();

      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_COMPLETE');
    });
  });

  describe('fetchMessages', () => {
    test('when messages to be fetched both before and after anchor, fetchingOlder and fetchingNewer is true', () => {
      const store = mockStore({
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 1 }],
        },
      });

      store.dispatch(fetchMessages(homeNarrow, 0, 1, 1, true));
      const actions = store.getActions();

      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
    });

    test('when no messages to be fetched before the anchor, fetchingOlder is false', () => {
      const store = mockStore({
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 1 }],
        },
      });

      store.dispatch(fetchMessages(homeNarrow, 0, -1, 1, true));
      const actions = store.getActions();

      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
    });

    test('when no messages to be fetched after the anchor, fetchingNewer is false', () => {
      const store = mockStore({
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 1 }],
        },
      });

      store.dispatch(fetchMessages(homeNarrow, 0, 1, -1, true));
      const actions = store.getActions();

      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
    });
  });

  describe('fetchMessagesAtFirstUnread', () => {
    test('message fetch start action is dispatched with fetchingOlder and fetchingNewer true', () => {
      const store = mockStore({
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 1 }],
        },
      });

      store.dispatch(fetchMessagesAtFirstUnread(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
    });
  });

  describe('fetchOlder', () => {
    test('message fetch start action is dispatched with fetchingOlder true', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { older: false },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 2 }],
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
        fetching: {
          [homeNarrowStr]: { older: false, newer: false },
        },
      });

      store.dispatch(fetchOlder(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
    });

    test('when caughtUp older is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { older: true },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 2 }],
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
        fetching: {
          [homeNarrowStr]: { older: false, newer: false },
        },
      });

      store.dispatch(fetchOlder(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(0);
    });

    test('when fetchingOlder older is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { older: false },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 2 }],
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
        fetching: {
          [homeNarrowStr]: { older: true, newer: false },
        },
      });

      store.dispatch(fetchOlder(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(0);
    });

    test('when needsInitialFetch is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: true,
        },
        caughtUp: {
          [homeNarrowStr]: { older: false },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 2 }],
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
        fetching: {},
      });

      store.dispatch(fetchOlder(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(0);
    });
  });

  describe('fetchNewer', () => {
    test('message fetch start action is dispatched with fetchingNewer true', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { newer: false },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 2 }],
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
        fetching: {},
      });

      store.dispatch(fetchNewer(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
    });

    test('when caughtUp newer is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { newer: true },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 2 }],
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
        fetching: {},
      });

      store.dispatch(fetchNewer(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(0);
    });

    test('when fetching.newer is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { newer: false },
        },
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 2 }],
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
        fetching: {
          homeNarrow: { older: false, newer: true },
        },
      });

      store.dispatch(fetchNewer(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(1);
      expect(actions[0].type).toBe('MESSAGE_FETCH_START');
    });

    test('when needsInitialFetch is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: true,
        },
        caughtUp: {
          [homeNarrowStr]: { newer: false },
        },
        fetching: {},
        ...navStateWithNarrow(homeNarrow),
        messages: {
          [streamNarrowStr]: [{ id: 2 }],
          [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
        },
      });

      store.dispatch(fetchNewer(homeNarrow));
      const actions = store.getActions();

      expect(actions.length).toBe(0);
    });
  });
});
