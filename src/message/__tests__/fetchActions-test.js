/* @flow strict-local */
import invariant from 'invariant';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Immutable from 'immutable';

import type { GlobalState } from '../../reduxTypes';
import type { Action } from '../../actionTypes';
import {
  isFetchNeededAtAnchor,
  fetchMessages,
  fetchOlder,
  fetchNewer,
  tryFetch,
} from '../fetchActions';
import { FIRST_UNREAD_ANCHOR } from '../../anchor';
import type { ServerMessage } from '../../api/messages/getMessages';
import { streamNarrow, HOME_NARROW, HOME_NARROW_STR, keyFromNarrow } from '../../utils/narrow';
import { GravatarURL } from '../../utils/avatar';
import * as eg from '../../__tests__/lib/exampleData';
import { ApiError } from '../../api/apiErrors';
import { fakeSleep } from '../../__tests__/lib/fakeTimers';
import { BackoffMachine } from '../../utils/async';

const mockStore = configureStore([thunk]);

const narrow = streamNarrow('some stream');
const streamNarrowStr = keyFromNarrow(narrow);

global.FormData = class FormData {};

const BORING_RESPONSE = JSON.stringify({
  messages: [],
  result: 'success',
});

describe('fetchActions', () => {
  afterEach(() => {
    fetch.reset();
  });

  describe('isFetchNeededAtAnchor', () => {
    test("false if we're caught up, even if there are no messages", () => {
      const state = eg.reduxStatePlus({
        session: { ...eg.plusReduxState.session, isHydrated: true },
        caughtUp: {
          [streamNarrowStr]: {
            newer: true,
            older: true,
          },
        },
        narrows: Immutable.Map({
          [streamNarrowStr]: [],
        }),
        streams: [eg.makeStream({ name: 'some stream' })],
      });

      const result = isFetchNeededAtAnchor(state, narrow, FIRST_UNREAD_ANCHOR);
      expect(result).toBeFalse();
    });

    test("true if we're not caught up, even if we have a few messages", () => {
      const message1 = eg.streamMessage({ id: 1 });
      const message2 = eg.streamMessage({ id: 2 });

      const state = eg.reduxStatePlus({
        session: { ...eg.plusReduxState.session, isHydrated: true },
        caughtUp: {
          [streamNarrowStr]: {
            newer: false,
            older: false,
          },
        },
        narrows: Immutable.Map({
          [streamNarrowStr]: [1],
        }),
        messages: eg.makeMessagesState([message1, message2]),
        streams: [eg.makeStream({ name: 'some stream' })],
      });

      const result = isFetchNeededAtAnchor(state, narrow, FIRST_UNREAD_ANCHOR);
      expect(result).toBeTrue();
    });
  });

  describe('tryFetch', () => {
    beforeAll(() => {
      jest.useFakeTimers('modern');

      // So we don't have to think about the (random, with jitter)
      // duration of these waits in these tests. `BackoffMachine` has
      // its own unit tests already, so we don't have to test that it
      // waits for the right amount of time.
      // $FlowFixMe[cannot-write]
      BackoffMachine.prototype.wait = async function wait() {
        return fakeSleep(100);
      };
    });

    afterEach(() => {
      expect(jest.getTimerCount()).toBe(0);
      jest.clearAllTimers();
    });

    test('resolves any promise, if there is no exception', async () => {
      const tryFetchFunc = jest.fn(async () => {
        await fakeSleep(10);
        return 'hello';
      });

      await expect(tryFetch(tryFetchFunc)).resolves.toBe('hello');

      expect(tryFetchFunc).toHaveBeenCalledTimes(1);
      await expect(tryFetchFunc.mock.results[0].value).resolves.toBe('hello');

      jest.runAllTimers();
    });

    test('retries a call, if there is an exception', async () => {
      // fail on first call, succeed second time
      let callCount = 0;
      const thrower = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('First run exception');
        }
        return 'hello';
      });

      const tryFetchFunc = jest.fn(async () => {
        await fakeSleep(10);
        return thrower();
      });

      await expect(tryFetch(tryFetchFunc)).resolves.toBe('hello');

      expect(tryFetchFunc).toHaveBeenCalledTimes(2);
      await expect(tryFetchFunc.mock.results[0].value).rejects.toThrow('First run exception');
      await expect(tryFetchFunc.mock.results[1].value).resolves.toBe('hello');

      jest.runAllTimers();
    });

    test('Rethrows a 4xx error without retrying', async () => {
      const apiError = new ApiError(400, {
        code: 'BAD_REQUEST',
        msg: 'Bad Request',
        result: 'error',
      });

      const func = jest.fn(async () => {
        throw apiError;
      });

      await expect(tryFetch(func)).rejects.toThrow(apiError);
      expect(func).toHaveBeenCalledTimes(1);

      jest.runAllTimers();
    });
  });

  describe('fetchMessages', () => {
    const email = 'abc123@example.com';
    const sender = {
      ...eg.makeUser(),
      email,
      avatar_url: GravatarURL.validateAndConstructInstance({ email }),
    };
    const message1 = eg.streamMessage({ id: 1, sender });

    // message1 exactly as we receive it from the server, before our
    // own transformations.
    //
    // TODO: Deduplicate this logic with similar logic in
    // migrateMessages-test.js.
    const serverMessage1: ServerMessage = {
      ...message1,
      reactions: [],
      avatar_url: null, // Null in server data will be transformed to a GravatarURL
    };

    const baseState = eg.reduxStatePlus({
      narrows: Immutable.Map({
        [streamNarrowStr]: [message1.id],
      }),
    });

    describe('success', () => {
      beforeEach(() => {
        const response = {
          messages: [serverMessage1],
          result: 'success',
        };
        fetch.mockResponseSuccess(JSON.stringify(response));
      });

      const store = mockStore<GlobalState, Action>(baseState);

      test('message fetch success action is dispatched, messages are returned', async () => {
        const returnValue = await store.dispatch(
          fetchMessages({ narrow: HOME_NARROW, anchor: 0, numBefore: 1, numAfter: 1 }),
        );
        const actions = store.getActions();

        expect(actions).toHaveLength(2);
        expect(actions[0].type).toBe('MESSAGE_FETCH_START');

        // Expect MESSAGE_FETCH_COMPLETE to be dispatched.
        //
        // TODO: More directly test that an error tripped in a reducer
        // handling MESSAGE_FETCH_COMPLETE (e.g., from malformed data
        // returned by a successful fetch) propagates to the caller.
        // redux-mock-store does not call any reducers; it's only
        // meant to test actions [1].
        //
        // We test this indirectly, for now: in the success case,
        // check that MESSAGE_FETCH_COMPLETE is dispatched before the
        // return. In real-live code (not using redux-mock-store), all
        // the reducers will run as part of the dispatch call (or, for
        // async actions, during the Promise returned by the dispatch
        // call), not scheduled to run later. So, as long as
        // MESSAGE_FETCH_COMPLETE is dispatched before the return, any
        // errors from the reducers will propagate. It's not an async
        // action, so the implementation doesn't even have to await
        // it.
        //
        // In an ideal crunchy-shell [2] world, we'll have validated
        // and rebuilt all data at the edge, making errors in the
        // reducers impossible -- so we won't have to handle errors at
        // that site.
        //
        // [1] https://github.com/reduxjs/redux-mock-store/blob/b943c3ba0/README.md#redux-mock-store-
        // [2] https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/.23M4156.20Message.20List.20placeholders/near/928778

        expect(actions[1].type).toBe('MESSAGE_FETCH_COMPLETE');
        expect(returnValue).toEqual([message1]);
      });
    });

    describe('failure', () => {
      test('rejects when user is not logged in, dispatches MESSAGE_FETCH_ERROR', async () => {
        const stateWithoutAccount = {
          ...baseState,
          accounts: [],
        };
        const store = mockStore<GlobalState, Action>(stateWithoutAccount);

        const response = {
          messages: [message1, eg.streamMessage({ id: 2 }), eg.streamMessage({ id: 3 })],
          result: 'success',
        };
        fetch.mockResponseSuccess(JSON.stringify(response));

        await expect(
          store.dispatch(
            fetchMessages({ narrow: HOME_NARROW, anchor: 0, numBefore: 1, numAfter: 1 }),
          ),
        ).rejects.toThrow(
          // Update this with changes to the message string or error type.
          new Error('Active account not logged in'),
        );

        const actions = store.getActions();

        expect(actions[actions.length - 1]).toMatchObject({
          type: 'MESSAGE_FETCH_ERROR',
          // Update this with changes to the message string or error type.
          error: new Error('Active account not logged in'),
        });
      });

      test("rejects when validation-at-the-edge can't handle data, dispatches MESSAGE_FETCH_ERROR", async () => {
        // This validation is done in `migrateMessages`.
        //
        // TODO: See if we can mock `migrateMessages` to throw an
        // error unconditionally. We don't want to care specifically
        // how the data is malformed. Making this mock isn't
        // straightforward, in part because Jest wants you to mock
        // entire modules. `migrateMessages`'s caller is in the
        // same file as `migrateMessages`; it doesn't import it. So we
        // can't intercept such an import and have it give amock.
        //
        // For now, we simulate #4156, a real-life problem that a user
        // at server commit 0af2f9d838 ran into [1], by having
        // `user` be missing on reactions on a message.
        //
        // [1] https://github.com/zulip/zulip-mobile/issues/4156#issuecomment-655905093
        const store = mockStore<GlobalState, Action>(baseState);

        // Missing `user` (and `user_id`, for good measure), to
        // simulate #4156.
        const faultyReaction = {
          reaction_type: 'unicode_emoji',
          emoji_code: '1f44d',
          emoji_name: 'thumbs_up',
        };

        const response = {
          // Flow would complain at `faultyReaction` if it
          // type-checked `response`, but we should ignore it if that
          // day comes. It's badly shaped on purpose.
          messages: [{ ...serverMessage1, reactions: [faultyReaction] }],
          result: 'success',
        };
        fetch.mockResponseSuccess(JSON.stringify(response));

        await expect(
          store.dispatch(
            fetchMessages({ narrow: HOME_NARROW, anchor: 0, numBefore: 1, numAfter: 1 }),
          ),
        ).rejects.toThrow(
          // Update this with changes to the error type.
          TypeError,
        );

        const actions = store.getActions();

        expect(actions[actions.length - 1]).toMatchObject({
          type: 'MESSAGE_FETCH_ERROR',
          // Update this with changes to the error type.
          error: expect.any(TypeError),
        });
      });

      test('rejects on fetch failure', async () => {
        const store = mockStore<GlobalState, Action>(baseState);

        const fetchError = new Error('Network request failed (or something)');

        fetch.mockResponseFailure(fetchError);

        await expect(
          store.dispatch(
            fetchMessages({ narrow: HOME_NARROW, anchor: 0, numBefore: 1, numAfter: 1 }),
          ),
        ).rejects.toThrow(fetchError);
      });
    });

    test('when messages to be fetched both before and after anchor, numBefore and numAfter are greater than zero', async () => {
      const store = mockStore<GlobalState, Action>(
        eg.reduxStatePlus({
          narrows: Immutable.Map({
            [streamNarrowStr]: [1],
          }),
        }),
      );

      fetch.mockResponseSuccess(BORING_RESPONSE);

      await store.dispatch(
        fetchMessages({ narrow: HOME_NARROW, anchor: 0, numBefore: 1, numAfter: 1 }),
      );
      const actions = store.getActions();

      expect(actions.length).toBeGreaterThanOrEqual(1);
      const [action] = actions;
      expect(action.type).toBe('MESSAGE_FETCH_START');
      invariant(action.type === 'MESSAGE_FETCH_START', 'expect failed');
      expect(action.numBefore).toBeGreaterThan(0);
      expect(action.numAfter).toBeGreaterThan(0);
    });

    test('when no messages to be fetched before the anchor, numBefore is not greater than zero', async () => {
      const store = mockStore<GlobalState, Action>(
        eg.reduxStatePlus({
          narrows: Immutable.Map({
            [streamNarrowStr]: [1],
          }),
        }),
      );

      fetch.mockResponseSuccess(BORING_RESPONSE);

      await store.dispatch(
        fetchMessages({ narrow: HOME_NARROW, anchor: 0, numBefore: -1, numAfter: 1 }),
      );
      const actions = store.getActions();

      expect(actions.length).toBeGreaterThanOrEqual(1);
      const [action] = actions;
      expect(action.type).toBe('MESSAGE_FETCH_START');
      invariant(action.type === 'MESSAGE_FETCH_START', 'expect failed');
      expect(action.numBefore).not.toBeGreaterThan(0);
    });

    test('when no messages to be fetched after the anchor, numAfter is not greater than zero', async () => {
      const store = mockStore<GlobalState, Action>(
        eg.reduxStatePlus({
          narrows: Immutable.Map({
            [streamNarrowStr]: [1],
          }),
        }),
      );

      fetch.mockResponseSuccess(BORING_RESPONSE);

      await store.dispatch(
        fetchMessages({ narrow: HOME_NARROW, anchor: 0, numBefore: 1, numAfter: -1 }),
      );
      const actions = store.getActions();

      expect(actions.length).toBeGreaterThanOrEqual(1);
      const [action] = actions;
      expect(action.type).toBe('MESSAGE_FETCH_START');
      invariant(action.type === 'MESSAGE_FETCH_START', 'expect failed');
      expect(action.numAfter).not.toBeGreaterThan(0);
    });
  });

  describe('fetchOlder', () => {
    const message1 = eg.streamMessage({ id: 1 });
    const message2 = eg.streamMessage({ id: 2 });

    const baseState = eg.reduxStatePlus({
      narrows: eg.plusReduxState.narrows.merge(
        Immutable.Map({
          [streamNarrowStr]: [message2.id],
          [HOME_NARROW_STR]: [message1.id, message2.id],
        }),
      ),
      messages: eg.makeMessagesState([message1, message2]),
    });

    beforeEach(() => {
      fetch.mockResponseSuccess(BORING_RESPONSE);
    });

    test('message fetch start action is dispatched with numBefore greater than zero', async () => {
      const store = mockStore<GlobalState, Action>({
        ...baseState,
        fetching: {
          ...baseState.fetching,
          [HOME_NARROW_STR]: {
            older: false,
            newer: false,
          },
        },
      });

      await store.dispatch(fetchOlder(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(1);
      const [action] = actions;
      expect(action.type).toBe('MESSAGE_FETCH_START');
      invariant(action.type === 'MESSAGE_FETCH_START', 'expect failed');
      expect(action.numBefore).toBeGreaterThan(0);
    });

    test('when caughtUp older is true, no action is dispatched', async () => {
      const store = mockStore<GlobalState, Action>({
        ...baseState,
        caughtUp: {
          ...baseState.caughtUp,
          [HOME_NARROW_STR]: {
            older: true,
            newer: true,
          },
        },
      });

      await store.dispatch(fetchOlder(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('when fetchingOlder older is true, no action is dispatched', async () => {
      const store = mockStore<GlobalState, Action>({
        ...baseState,
        fetching: {
          ...baseState.fetching,
          [HOME_NARROW_STR]: {
            older: true,
            newer: true,
          },
        },
      });

      await store.dispatch(fetchOlder(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('when needsInitialFetch is true, no action is dispatched', async () => {
      const store = mockStore<GlobalState, Action>({
        ...baseState,
        session: {
          ...baseState.session,
          needsInitialFetch: true,
        },
      });

      await store.dispatch(fetchOlder(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });
  });

  describe('fetchNewer', () => {
    const message1 = eg.streamMessage({ id: 1 });
    const message2 = eg.streamMessage({ id: 2 });

    const baseState = eg.reduxStatePlus({
      narrows: eg.plusReduxState.narrows.merge(
        Immutable.Map({
          [streamNarrowStr]: [message2.id],
          [HOME_NARROW_STR]: [message1.id, message2.id],
        }),
      ),
      messages: eg.makeMessagesState([message1, message2]),
    });

    beforeEach(() => {
      fetch.mockResponseSuccess(BORING_RESPONSE);
    });

    test('message fetch start action is dispatched with numAfter greater than zero', async () => {
      const store = mockStore<GlobalState, Action>({
        ...baseState,
        fetching: {
          ...baseState.fetching,
          [HOME_NARROW_STR]: {
            older: false,
            newer: false,
          },
        },
      });

      await store.dispatch(fetchNewer(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(1);
      const [action] = actions;
      expect(action.type).toBe('MESSAGE_FETCH_START');
      invariant(action.type === 'MESSAGE_FETCH_START', 'expect failed');
      expect(action.numAfter).toBeGreaterThan(0);
    });

    test('when caughtUp newer is true, no action is dispatched', async () => {
      const store = mockStore<GlobalState, Action>({
        ...baseState,
        caughtUp: {
          ...baseState.caughtUp,
          [HOME_NARROW_STR]: {
            older: true,
            newer: true,
          },
        },
      });

      await store.dispatch(fetchNewer(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('when fetching.newer is true, no action is dispatched', async () => {
      const store = mockStore<GlobalState, Action>({
        ...baseState,
        fetching: {
          ...baseState.fetching,
          [HOME_NARROW_STR]: {
            older: false,
            newer: true,
          },
        },
      });

      await store.dispatch(fetchNewer(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });

    test('when needsInitialFetch is true, no action is dispatched', async () => {
      const store = mockStore<GlobalState, Action>({
        ...baseState,
        session: {
          ...baseState.session,
          needsInitialFetch: true,
        },
      });

      await store.dispatch(fetchNewer(HOME_NARROW));
      const actions = store.getActions();

      expect(actions).toHaveLength(0);
    });
  });
});
