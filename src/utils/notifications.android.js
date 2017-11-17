/* @flow */
import { NotificationsAndroid } from 'react-native-notifications';

import type { Auth } from '../types';
import { registerPush } from '../api';
import { streamNarrow, privateNarrow } from '../utils/narrow';
import { logErrorRemotely } from '../utils/logging';

export const handlePendingNotifications = async (notification, doNarrow) => {
  if (notification) {
    const data = notification.getData();
    console.log('Opened app by notification', data); //eslint-disable-line
    if (data && data.recipient_type) {
      if (data.recipient_type === 'stream') {
        doNarrow(streamNarrow(data.stream, data.topic));
      } else if (data.recipient_type === 'private') {
        doNarrow(privateNarrow(data.sender_email));
      }
    }
  }
};

const handleRegistrationUpdates = (auth: Auth, saveTokenPush) => {
  NotificationsAndroid.setRegistrationTokenUpdateListener(async deviceToken => {
    try {
      await registerPush(auth, deviceToken);
      saveTokenPush(deviceToken);
    } catch (e) {
      logErrorRemotely(e, 'failed to register GCM');
    }
  });
};

export const initializeNotifications = (auth: Auth, saveTokenPush: string, doNarrow) => {
  handleRegistrationUpdates(auth, saveTokenPush);
};

export const refreshNotificationToken = () => {
  NotificationsAndroid.refreshToken();
};
