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
  doNarrowAtAnchor: Actions.doNarrow,
) => {
  if (notification) {
    const notifData = notification.getData();
    if (notifData && notifData.custom) {
      const { custom: { data } } = notifData;
      if (data) {
        handleNotification(data, doNarrowAtAnchor, data.message_ids[0]);
      }
    }
  }
};

export const tryInitialNotification = async (doNarrowAtAnchor: Actions.doNarrow) => {
  const data = await PushNotificationIOS.getInitialNotification();
  if (data && data.getData) {
    handlePendingNotifications(data, doNarrowAtAnchor);
  }
};
