/* @flow */
import NotificationsIOS from 'react-native-notifications';
import { PushNotificationIOS } from 'react-native';

import type { Auth, Actions, UserIdMap } from '../types';
import config from '../config';
import { registerPush } from '../api';
import { logErrorRemotely } from './logging';
import { getNarrowFromNotificationData } from './notificationsCommon';

const onPushRegistered = async (
  auth: Auth,
  deviceToken: string,
  saveTokenPush: any /* Actions.saveTokenPush */,
) => {
  const result = await registerPush(auth, deviceToken);
  saveTokenPush(deviceToken, result.msg, result.result);
};

export const addNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsIOS.addEventListener('notificationOpened', notificationHandler);
};

export const removeNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsIOS.removeEventListener('notificationOpened', notificationHandler);
};

export const initializeNotifications = (
  auth: Auth,
  saveTokenPush: any /* Actions.saveTokenPush */,
) => {
  NotificationsIOS.addEventListener('remoteNotificationsRegistered', deviceToken =>
    onPushRegistered(auth, deviceToken, saveTokenPush),
  );
  NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', (error: string) => {
    logErrorRemotely(new Error(error), 'register ios push token failed');
  });
  NotificationsIOS.requestPermissions();
};

export const refreshNotificationToken = () => {};

export const handlePendingNotifications = (
  notificationData: Object,
  actions: Actions,
  usersById: UserIdMap,
) => {
  if (!notificationData || !notificationData.getData) {
    return;
  }

  const data = notificationData.getData();
  config.startup.notification = data.zulip;
  if (data && data.zulip) {
    actions.doNarrow(getNarrowFromNotificationData(data, usersById));
  }
};

export const handleInitialNotification = async (actions: Actions, usersById: UserIdMap) => {
  const data = await PushNotificationIOS.getInitialNotification();
  handlePendingNotifications(data, actions, usersById);
};
