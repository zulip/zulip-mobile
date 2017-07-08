/* @flow */
import type { Auth, Dispatch, Action } from '../types';
import { homeNarrow, specialNarrow } from '../utils/narrow';
import { tryUntilSuccessful } from '../utils/async';
import { getSubscriptions, getMessages, getStreams, getUsers, getRealmEmojis } from '../api';
import { refreshNotificationToken } from '../utils/notifications';
import { messageFetchSuccess } from '../message/messagesActions';
import { initSubscriptions } from '../subscriptions/subscriptionsActions';
import { initRealmEmojis } from '../emoji/realmEmojiActions';
import { initStreams } from '../streamlist/streamsActions';
import { initUsers } from '../users/usersActions';
import {
  INITIAL_FETCH_COMPLETE,
  SAVE_TOKEN_PUSH,
  DELETE_TOKEN_PUSH,
} from '../actionConstants';

export const initialFetchComplete = (): Action => ({
  type: INITIAL_FETCH_COMPLETE,
});

export const fetchEssentialInitialData = (auth: Auth): Action =>
  async (dispatch: Dispatch) => {
    const [subscriptions, messages] = await Promise.all([
      await tryUntilSuccessful(() => getSubscriptions(auth)),
      await tryUntilSuccessful(() => getMessages(auth, 0, 10, 10, homeNarrow(), true)),
    ]);

    dispatch(messageFetchSuccess(
      messages,
      homeNarrow(),
      { older: false, newer: false },
      {},
    ));
    dispatch(initSubscriptions(subscriptions));
    dispatch(initialFetchComplete());
  };

export const fetchRestOfInitialData = (auth: Auth, pushToken: string): Action =>
  async (dispatch: Dispatch) => {
    const [streams, users, messages, realmEmoji] = await Promise.all([
      await tryUntilSuccessful(() => getStreams(auth)),
      await tryUntilSuccessful(() => getUsers(auth)),
      await tryUntilSuccessful(() =>
        getMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, specialNarrow('private'))
      ),
      await tryUntilSuccessful(() => getRealmEmojis(auth)),
    ]);
    dispatch(messageFetchSuccess(messages, specialNarrow('private')));
    dispatch(initStreams(streams));
    dispatch(initUsers(users));
    dispatch(initRealmEmojis(realmEmoji));
    if (auth.apiKey !== '' && pushToken === '') {
      refreshNotificationToken();
    }
  };

export const deleteTokenPush = (): Action => ({
  type: DELETE_TOKEN_PUSH
});

export const saveTokenPush = (pushToken: string): Action => ({
  type: SAVE_TOKEN_PUSH,
  pushToken
});
