import { homeNarrow, specialNarrow } from '../utils/narrow';
import { tryUntilSuccessful } from '../utils/async';
import { getSubscriptions, getMessages, getStreams, getUsers } from '../api';
import { messageFetchSuccess } from '../message/messagesActions';
import { initSubscriptions } from '../subscriptions/subscriptionsActions';
import { initStreams } from '../streamlist/streamsActions';
import { initUsers } from '../users/usersActions';
import { INITIAL_FETCH_COMPLETE } from '../constants';

export const initialFetchComplete = () => ({
  type: INITIAL_FETCH_COMPLETE,
});

export const fetchEssentialInitialData = (auth) =>
  async (dispatch) => {
    const [subscriptions, messages] = await Promise.all([
      await tryUntilSuccessful(() => getSubscriptions(auth)),
      await tryUntilSuccessful(() => getMessages(auth, 0, 10, 10, homeNarrow(), true)),
    ]);

    dispatch(messageFetchSuccess(messages, homeNarrow(), { older: false, newer: false }));
    dispatch(initSubscriptions(subscriptions));
    dispatch(initialFetchComplete());
  };

export const fetchRestOfInitialData = (auth) =>
  async (dispatch) => {
    const [streams, users, messages] = await Promise.all([
      await tryUntilSuccessful(() => getStreams(auth)),
      await tryUntilSuccessful(() => getUsers(auth)),
      await tryUntilSuccessful(() =>
        getMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, specialNarrow('private'))
      ),
    ]);

    dispatch(messageFetchSuccess(messages, specialNarrow('private')));
    dispatch(initStreams(streams));
    dispatch(initUsers(users));
  };
