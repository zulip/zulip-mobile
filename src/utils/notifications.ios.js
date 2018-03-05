/* @flow */
import NotificationsIOS from 'react-native-notifications';
import { PushNotificationIOS } from 'react-native';

import type { Auth, Actions } from '../types';
import { registerPush } from '../api';
import { logErrorRemotely } from './logging';
import { handleNotification } from './notificationsCommon';

const onPushRegistered = async (
  auth: Auth,
  deviceToken: string,
  saveTokenPush: Actions.saveTokenPush,
) => {
  const result = await registerPush(auth, deviceToken);
  saveTokenPush(deviceToken, result.msg, result.result);
};

const onPushRegistrationFailed = (error: string) => {
  logErrorRemotely(new Error(error), 'register ios push token failed');
};

export const addNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsIOS.addEventListener('notificationOpened', notificationHandler);
};

export const removeNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsIOS.removeEventListener('notificationOpened', notificationHandler);
};

export const initializeNotifications = (auth: Auth, saveTokenPush: Actions.saveTokenPush) => {
  NotificationsIOS.addEventListener('remoteNotificationsRegistered', deviceToken =>
    onPushRegistered(auth, deviceToken, saveTokenPush),
  );
  NotificationsIOS.addEventListener(
    'remoteNotificationsRegistrationFailed',
    onPushRegistrationFailed.bind(null, auth),
  );
  NotificationsIOS.requestPermissions();
};

export const refreshNotificationToken = () => {};

export const handlePendingNotifications = async (
  notification: Object,
  doNarrow: Actions.doNarrow,
) => {
  if (!notification) {
    return;
  }

  const data = notification.getData();
  if (!data || !data.custom || !data.custom.data) {
    return;
  }

  handleNotification(data.custom.data, doNarrow);
};

export const handleInitialNotification = async (actions: Actions) => {
  const data = await PushNotificationIOS.getInitialNotification();
  if (data && data.getData) {
    handlePendingNotifications(data, actions);
  }
};
