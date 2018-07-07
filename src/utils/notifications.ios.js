/* @flow */
import NotificationsIOS from 'react-native-notifications';
import { PushNotificationIOS } from 'react-native';

import type { Auth, Dispatch, UserIdMap } from '../types';
import config from '../config';
import { registerPush } from '../api';
import { logErrorRemotely } from './logging';
import { getNarrowFromNotificationData } from './notificationsCommon';
import type { SavePushTokenCallback } from './notificationsCommon';
import { doNarrow } from '../actions';

export const addNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsIOS.addEventListener('notificationOpened', notificationHandler);
};

export const removeNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsIOS.removeEventListener('notificationOpened', notificationHandler);
};

export const initializeNotifications = (auth: Auth, saveTokenPush: SavePushTokenCallback) => {
  NotificationsIOS.addEventListener('remoteNotificationsRegistered', async deviceToken => {
    const result = await registerPush(auth, deviceToken);
    saveTokenPush(deviceToken, result.msg, result.result);
  });
  NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', (error: string) => {
    logErrorRemotely(new Error(error), 'register ios push token failed');
  });
  NotificationsIOS.requestPermissions();
};

export const refreshNotificationToken = () => {};

export const handlePendingNotifications = (
  notificationData: Object,
  dispatch: Dispatch,
  usersById: UserIdMap,
) => {
  if (!notificationData || !notificationData.getData) {
    return;
  }

  const data = notificationData.getData();
  config.startup.notification = data.zulip;
  if (data && data.zulip) {
    dispatch(doNarrow(getNarrowFromNotificationData(data, usersById)));
  }
};

export const handleInitialNotification = async (dispatch: Dispatch, usersById: UserIdMap) => {
  const data = await PushNotificationIOS.getInitialNotification();
  handlePendingNotifications(data, dispatch, usersById);
};
