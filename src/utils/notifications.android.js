/* @flow */
import { NotificationsAndroid, PendingNotifications } from 'react-native-notifications';

import type { Auth, Actions } from '../types';
import { registerPush } from '../api';
import { logErrorRemotely } from '../utils/logging';
import { handleNotification } from './notificationsCommon';

export const handlePendingNotifications = async (
  notification: Object,
  pending: boolean,
  doNarrow: Actions.doNarrow,
) => {
  if (notification) {
    const data = notification.getData();
    console.log('Opened app by notification', data); //eslint-disable-line
    if (data) {
      handleNotification(data, data.zulip_message_id, pending, doNarrow);
    }
  }
};

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

export const tryInitialNotification = async (
  doNarrow: Actions.doNarrow,
  saveInitialNotificationDetails: Actions.saveInitialNotificationDetails,
) => {
  const data = await PendingNotifications.getInitialNotification();
  if (data && data.getData) {
    saveInitialNotificationDetails(data.getData());
    handlePendingNotifications(data, true, doNarrow);
  }
};
