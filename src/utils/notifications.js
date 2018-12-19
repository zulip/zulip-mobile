/* @flow */
import { Platform, PushNotificationIOS } from 'react-native';
import NotificationsIOS, {
  NotificationsAndroid,
  PendingNotifications,
} from 'react-native-notifications';

import type { Auth, Dispatch, Notification, NotificationGroup, UserIdMap } from '../types';
import { HOME_NARROW, topicNarrow, privateNarrow, groupNarrow } from '../utils/narrow';
import config from '../config';
import { registerPush } from '../api';
import { logErrorRemotely } from './logging';
import { doNarrow } from '../message/messagesActions';

const getGroupNarrowFromNotificationData = (data: NotificationGroup, usersById: UserIdMap = {}) => {
  const userIds = data.pm_users.split(',');
  const users = userIds.map(id => usersById[id]);
  const doAllUsersExist = users.every(user => user);

  return doAllUsersExist ? groupNarrow(users.map(user => user.email)) : HOME_NARROW;
};

export const getNarrowFromNotificationData = (data: Notification, usersById: UserIdMap = {}) => {
  if (!data || !data.recipient_type) {
    return HOME_NARROW;
  }

  if (data.recipient_type === 'stream') {
    return topicNarrow(data.stream, data.topic);
  }

  // $FlowFixMe
  if (!data.pm_users) {
    return privateNarrow(data.sender_email);
  }

  return getGroupNarrowFromNotificationData(data, usersById);
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

export class NotificationListener {
  handleNotificationOpen: (notification: Object) => void;

  constructor(dispatch: Dispatch, usersById: UserIdMap) {
    this.handleNotificationOpen = notification => {
      handlePendingNotifications(notification, dispatch, usersById);
    };
  }

  start() {
    if (Platform.OS === 'ios') {
      NotificationsIOS.addEventListener('notificationOpened', this.handleNotificationOpen);
    } else {
      NotificationsAndroid.setNotificationOpenedListener(this.handleNotificationOpen);
    }
  }

  stop() {
    if (Platform.OS === 'ios') {
      NotificationsIOS.removeEventListener('notificationOpened', this.handleNotificationOpen);
    } else {
      // do nothing
    }
  }
}

export const initializeNotifications = (
  auth: Auth,
  saveTokenPush: (pushToken: string, msg: string, result: string) => void,
) => {
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
