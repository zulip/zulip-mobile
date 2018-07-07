/* @flow */
import { NotificationsAndroid, PendingNotifications } from 'react-native-notifications';

import type { Auth, Dispatch, UserIdMap } from '../types';
import config from '../config';
import { registerPush } from '../api';
import { logErrorRemotely } from './logging';
import { getNarrowFromNotificationData } from './notificationsCommon';
import type { SavePushTokenCallback } from './notificationsCommon';
import { doNarrow } from '../actions';

export const addNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsAndroid.setNotificationOpenedListener(notificationHandler);
};

export const removeNotificationListener = (
  notificationHandler: (notification: Object) => void,
) => {};

export const initializeNotifications = (auth: Auth, saveTokenPush: SavePushTokenCallback) => {
  NotificationsAndroid.setRegistrationTokenUpdateListener(async deviceToken => {
    try {
      const result = await registerPush(auth, deviceToken);
      saveTokenPush(deviceToken, result.msg, result.result);
    } catch (e) {
      logErrorRemotely(e, 'failed to register GCM');
    }
  });
};

export const refreshNotificationToken = () => {
  NotificationsAndroid.refreshToken();
};

export const handlePendingNotifications = (
  notificationData: Object,
  dispatch: Dispatch,
  usersById: UserIdMap,
) => {
  if (!notificationData || !notificationData.getData) {
    return;
  }

  const data = notificationData.getData();
  config.startup.notification = data;
  if (data) {
    dispatch(doNarrow(getNarrowFromNotificationData(data, usersById)));
  }
};

export const handleInitialNotification = async (dispatch: Dispatch, usersById: UserIdMap) => {
  const data = await PendingNotifications.getInitialNotification();
  handlePendingNotifications(data, dispatch, usersById);
};
