/* @flow */
import NotificationsIOS from 'react-native-notifications';
import { PushNotificationIOS } from 'react-native';

import type { Auth, Actions, Notification } from '../types';
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

const onPushRegistrationFailed = (error: string) => {
  logErrorRemotely(new Error(error), 'register ios push token failed');
};

export const addNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsIOS.addEventListener('notificationOpened', notificationHandler);
};

export const removeNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsIOS.removeEventListener('notificationOpened', notificationHandler);
};

export const initializeNotifications = (
  auth: Auth, saveTokenPush: any /* Actions.saveTokenPush */,
) => {
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

export const handlePendingNotifications = async (notification: Notification, actions: Actions) => {
  if (!notification || !notification.getData) {
    return;
  }

  const data = notification.getData();
  config.startup.notification = data;
  if (!data || !data.custom || !data.custom.data) {
    return;
  }
  actions.doNarrow(getNarrowFromNotificationData(data), data.zulip_message_id);
};

export const handleInitialNotification = async (actions: Actions) => {
  const notification = await PushNotificationIOS.getInitialNotification();
  handlePendingNotifications(notification, actions);
};
