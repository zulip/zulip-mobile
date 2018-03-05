/* @flow */
import { NotificationsAndroid, PendingNotifications } from 'react-native-notifications';

import type { Auth, Actions } from '../types';
import { registerPush } from '../api';
import { logErrorRemotely } from '../utils/logging';
import { handleNotification } from './notificationsCommon';

const handleRegistrationUpdates = (auth: Auth, saveTokenPush: Actions.saveTokenPush) => {
  NotificationsAndroid.setRegistrationTokenUpdateListener(async deviceToken => {
    try {
      const result = await registerPush(auth, deviceToken);
      saveTokenPush(deviceToken, result.msg, result.result);
    } catch (e) {
      logErrorRemotely(e, 'failed to register GCM');
    }
  });
};

export const addNotificationListener = (notificationHandler: (notification: Object) => void) => {
  NotificationsAndroid.setNotificationOpenedListener(notificationHandler);
};

export const removeNotificationListener = (
  notificationHandler: (notification: Object) => void,
) => {};

export const initializeNotifications = (auth: Auth, saveTokenPush: Actions.saveTokenPush) => {
  handleRegistrationUpdates(auth, saveTokenPush);
};

export const refreshNotificationToken = () => {
  NotificationsAndroid.refreshToken();
};

export const handlePendingNotifications = async (notification: Object, actions: Actions) => {
  if (!notification) {
    return;
  }

  const data = notification.getData();
  if (data) {
    handleNotification(data, actions);
  }
};

export const handleInitialNotification = async (actions: Actions) => {
  const data = await PendingNotifications.getInitialNotification();
  if (data && data.getData) {
    handlePendingNotifications(data, actions);
  }
};
