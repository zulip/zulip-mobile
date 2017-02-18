import { homeNarrow, specialNarrow } from '../utils/narrow';
import { getSubscriptions, getMessages, getStreams, getUsers } from '../api';
import { messageFetchSuccess } from '../message-list/messagesActions';
import { initSubscriptions } from '../subscriptions/subscriptionsActions';
import { initStreams } from '../streamlist/streamsActions';
import { initUsers } from '../users/userListActions';
import { FETCH_INITIAL_REALM_DATA } from '../constants';

export const fetchInitialRealmData = () => ({
  type: FETCH_INITIAL_REALM_DATA,
});

export const fetchEssentialInitialData = (auth) =>
  async (dispatch) => {
    const [subscriptions, messages] = await Promise.all([
      await getSubscriptions(auth),
      await getMessages(auth, 0, 20, 1, homeNarrow(), true),
    ]);

    dispatch(messageFetchSuccess(
      messages,
      0,
      homeNarrow(),
    ));
    dispatch(initSubscriptions(subscriptions));
  };

export const fetchRestOfInitialData = (auth) =>
  async (dispatch) => {
    const [streams, users, messages] = await Promise.all([
      await getStreams(auth),
      await getUsers(auth),
      await getMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, specialNarrow('private')),
    ]);

    dispatch(messageFetchSuccess(
      messages,
      Number.MAX_SAFE_INTEGER,
      specialNarrow('private'),
    ));
    dispatch(initStreams(streams));
    dispatch(initUsers(users));
    // pollForData
  };
