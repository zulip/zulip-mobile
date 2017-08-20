/* @flow */
import DeviceInfo from 'react-native-device-info';

import type { GetState, Dispatch, Action } from '../types';
import config from '../config';
import { allPrivateNarrow } from '../utils/narrow';
import { tryUntilSuccessful } from '../utils/async';
import {
  getSubscriptions,
  getMessages,
  getStreams,
  getUsers,
  getRealmEmojis,
  getRealmFilters,
  getAlertWords,
  registerForEvents,
} from '../api';
import { refreshNotificationToken, initializeNotifications } from '../utils/notifications';
import { messageFetchSuccess, switchNarrow } from '../message/messagesActions';
import { initSubscriptions } from '../subscriptions/subscriptionsActions';
import { initRealmEmojis } from '../emoji/realmEmojiActions';
import { initRealmFilters } from './realmFilterActions';
import { initAlertWords } from '../alertWords/alertWordsActions';
import { initStreams } from '../streams/streamsActions';
import { initUsers, sendFocusPing } from '../users/usersActions';
import { getAuth, getActiveNarrow, getPushToken } from '../selectors';
import { trySendMessages } from '../outbox/outboxActions';
import { startEventPolling } from '../events/eventActions';

import {
  REALM_INIT,
  INITIAL_FETCH_COMPLETE,
  SAVE_TOKEN_PUSH,
  DELETE_TOKEN_PUSH,
} from '../actionConstants';

export const realmInit = (data: Object): Action => ({
  type: REALM_INIT,
  data,
});
export const initialFetchComplete = (): Action => ({
  type: INITIAL_FETCH_COMPLETE,
});

export const deleteTokenPush = (): Action => ({
  type: DELETE_TOKEN_PUSH,
});

const saveTokenPush = (pushToken: string) => ({
  type: SAVE_TOKEN_PUSH,
  pushToken,
});

export const initNotifications = (): Action => (dispatch: Dispatch, getState: GetState) => {
  initializeNotifications(
    getAuth(getState()),
    token => dispatch(saveTokenPush(token)),
    switchNarrow,
  );
};

export const fetchEssentialInitialData = (): Action => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const narrow = getActiveNarrow(getState());

  const [initData, subscriptions, messages] = await Promise.all([
    await tryUntilSuccessful(() => registerForEvents(auth)),
    await tryUntilSuccessful(() => getSubscriptions(auth)),
    await tryUntilSuccessful(() =>
      getMessages(
        auth,
        0,
        config.messagesPerRequest / 2,
        config.messagesPerRequest / 2,
        narrow,
        true,
      ),
    ),
  ]);

  dispatch(realmInit(initData));
  dispatch(
    messageFetchSuccess(
      messages,
      narrow,
      0,
      config.messagesPerRequest / 2,
      config.messagesPerRequest / 2,
      true,
    ),
  );
  dispatch(initSubscriptions(subscriptions));
  dispatch(initialFetchComplete());

  dispatch(startEventPolling(initData.queue_id, initData.last_event_id));
};

export const fetchRestOfInitialData = (): Action => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const pushToken = getPushToken(getState());
  const [streams, users, messages, realmEmoji, realmFilter, alertWords] = await Promise.all([
    await tryUntilSuccessful(() => getStreams(auth)),
    await tryUntilSuccessful(() => getUsers(auth)),
    await tryUntilSuccessful(() =>
      getMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, allPrivateNarrow),
    ),
    await tryUntilSuccessful(() => getRealmEmojis(auth)),
    await tryUntilSuccessful(() => getRealmFilters(auth)),
    await tryUntilSuccessful(() => getAlertWords(auth)),
  ]);
  dispatch(messageFetchSuccess(messages, allPrivateNarrow, 0, 0, 0, true));
  dispatch(initStreams(streams));
  dispatch(initUsers(users));
  dispatch(initRealmEmojis(realmEmoji));
  dispatch(initRealmFilters(realmFilter));
  dispatch(initAlertWords(alertWords));
  if (auth.apiKey !== '' && pushToken === '') {
    refreshNotificationToken();
  }
};

export const doInitialFetch = (): Action => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(fetchEssentialInitialData());
  dispatch(fetchRestOfInitialData());
  dispatch(trySendMessages());

  if (!DeviceInfo.isEmulator()) {
    dispatch(initNotifications());
  }
  dispatch(sendFocusPing());
  setInterval(() => sendFocusPing(), 60 * 1000);
};
