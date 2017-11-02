import mockStore from 'redux-mock-store'; // eslint-disable-line

import {
  backgroundFetchMessages,
  fetchMessages,
  fetchMessagesAtFirstUnread,
  fetchOlder,
  fetchNewer,
} from '../fetchActions';
import { streamNarrow, homeNarrow, homeNarrowStr } from '../../utils/narrow';

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
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 1 }],
          },
        },
      });

      const response = '{"messages": [{"id": 1}, {"id": 2}, {"id": 3}], "result": "success"}';
      fetch.mockResponseSuccess(response);

      await store.dispatch(backgroundFetchMessages(homeNarrow, 0, 1, 1, true));
      expect(store.getActions()).toMatchSnapshot();
    });
  });

  describe('fetchMessages', () => {
    test('when messages to be fetched both before and after anchor, fetchingOlder and fetchingNewer is true', () => {
      const store = mockStore({
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 1 }],
          },
        },
      });

      store.dispatch(fetchMessages(homeNarrow, 0, 1, 1, true));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when no messages to be fetched before the anchor, fetchingOlder is false', () => {
      const store = mockStore({
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 1 }],
          },
        },
      });

      store.dispatch(fetchMessages(homeNarrow, 0, -1, 1, true));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when no messages to be fetched after the anchor, fetchingNewer is false', () => {
      const store = mockStore({
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 1 }],
          },
        },
      });

      store.dispatch(fetchMessages(homeNarrow, 0, 1, -1, true));
      expect(store.getActions()).toMatchSnapshot();
    });
  });

  describe('fetchMessagesAtFirstUnread', () => {
    test('message fetch start action is dispatched with fetchingOlder and fetchingNewer true', () => {
      const store = mockStore({
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 1 }],
          },
        },
      });

      store.dispatch(fetchMessagesAtFirstUnread(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
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
        chat: {
          fetchingOlder: false,
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 2 }],
            [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          },
        },
        fetching: {},
      });

      store.dispatch(fetchOlder(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when caughtUp older is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { older: true },
        },
        chat: {
          fetchingOlder: false,
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 2 }],
            [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          },
        },
        fetching: {},
      });

      store.dispatch(fetchOlder(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when fetchingOlder older is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { older: false },
        },
        chat: {
          fetchingOlder: true,
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 2 }],
            [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          },
        },
        fetching: {},
      });

      store.dispatch(fetchOlder(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when needsInitialFetch is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: true,
        },
        caughtUp: {
          [homeNarrowStr]: { older: false },
        },
        chat: {
          fetchingOlder: false,
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 2 }],
            [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          },
        },
        fetching: {},
      });

      store.dispatch(fetchOlder(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
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
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 2 }],
            [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          },
        },
        fetching: {},
      });

      store.dispatch(fetchNewer(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when caughtUp newer is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { newer: true },
        },
        chat: {
          fetchingNewer: false,
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 2 }],
            [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          },
        },
        fetching: {},
      });

      store.dispatch(fetchNewer(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
    });

    test('when fetching.newer is true, no action is dispatched', () => {
      const store = mockStore({
        app: {
          needsInitialFetch: false,
        },
        caughtUp: {
          [homeNarrowStr]: { newer: false },
        },
        chat: {
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 2 }],
            [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          },
        },
        fetching: {
          homeNarrow: { older: false, newer: true },
        },
      });

      store.dispatch(fetchNewer(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
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
        chat: {
          fetchingNewer: false,
          narrow: homeNarrow,
          messages: {
            [streamNarrowStr]: [{ id: 2 }],
            [homeNarrowStr]: [{ id: 1 }, { id: 2 }],
          },
        },
      });

      store.dispatch(fetchNewer(homeNarrow));
      expect(store.getActions()).toMatchSnapshot();
    });
  });
});
