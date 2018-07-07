/* @flow */
import { Platform, PushNotificationIOS } from 'react-native';
import NotificationsIOS, {
  NotificationsAndroid,
  PendingNotifications,
} from 'react-native-notifications';

import type { Auth, Dispatch, UserIdMap } from '../types';
import config from '../config';
import { registerPush } from '../api';
import { logErrorRemotely } from './logging';
import { getNarrowFromNotificationData } from './notificationsCommon';
import type { SavePushTokenCallback } from './notificationsCommon';
import { doNarrow } from '../actions';

export const addNotificationListener = (notificationHandler: (notification: Object) => void) => {
  if (Platform.OS === 'ios') {
    NotificationsIOS.addEventListener('notificationOpened', notificationHandler);
  } else {
    NotificationsAndroid.setNotificationOpenedListener(notificationHandler);
  }
};

export const removeNotificationListener = (notificationHandler: (notification: Object) => void) => {
  if (Platform.OS === 'ios') {
    NotificationsIOS.removeEventListener('notificationOpened', notificationHandler);
  } else {
    // do nothing
  }
};

export const initializeNotifications = (auth: Auth, saveTokenPush: SavePushTokenCallback) => {
  if (Platform.OS === 'ios') {
    NotificationsIOS.addEventListener('remoteNotificationsRegistered', async deviceToken => {
      const result = await registerPush(auth, deviceToken);
      saveTokenPush(deviceToken, result.msg, result.result);
    });
    NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', (error: string) => {
      logErrorRemotely(new Error(error), 'Failed to register iOS push token');
    });
    NotificationsIOS.requestPermissions();
  } else {
    NotificationsAndroid.setRegistrationTokenUpdateListener(async deviceToken => {
      try {
        const result = await registerPush(auth, deviceToken);
        saveTokenPush(deviceToken, result.msg, result.result);
      } catch (e) {
        logErrorRemotely(e, 'Failed to register GCM');
      }
    });
  }
};

export const refreshNotificationToken = () => {
  if (Platform.OS === 'ios') {
    // do nothing
  } else {
    NotificationsAndroid.refreshToken();
  }
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
  const extractedData = data && data.zulip ? data.zulip : data;
  config.startup.notification = extractedData;
  if (extractedData) {
    dispatch(doNarrow(getNarrowFromNotificationData(data, usersById)));
  }
};

export const handleInitialNotification = async (dispatch: Dispatch, usersById: UserIdMap) => {
  const NotificationService = Platform.OS === 'ios' ? PushNotificationIOS : PendingNotifications;
  const data = await NotificationService.getInitialNotification();
  handlePendingNotifications(data, dispatch, usersById);
};
