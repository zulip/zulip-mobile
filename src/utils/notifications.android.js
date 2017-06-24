/* @flow */
import { NotificationsAndroid, PendingNotifications } from 'react-native-notifications';

import registerGCM from '../api/registerGCM';
import { streamNarrow, privateNarrow } from '../utils/narrow';
import { Auth } from '../types';


const handlePendingNotifications = async (switchNarrow) => {
  const notification = await PendingNotifications.getInitialNotification();
  if (notification) {
    const data = notification.getData();
    // console.log('Opened app by notification', data); //eslint-disable-line
    if (data.recipient_type === 'stream') {
      switchNarrow(streamNarrow(data.stream, data.topic));
    } else if (data.recipient_type === 'private') {
      switchNarrow(privateNarrow(data.sender_email));
    }
  }
};

const handleRegistrationUpdates = (auth: Auth, saveTokenGCM) => {
  NotificationsAndroid.setRegistrationTokenUpdateListener(async (deviceToken) => {
    try {
      await registerGCM(auth, deviceToken);
    } catch (e) {
      // console.log('error ', e); //eslint-disable-line
    }
    saveTokenGCM(deviceToken);
  });
};

export const initializeNotifications = (auth: Auth, saveTokenGCM: string, doNarrow) => {
  handlePendingNotifications(doNarrow);
  handleRegistrationUpdates(auth, saveTokenGCM);
};

export const refreshNotificationToken = () => {
  NotificationsAndroid.refreshToken();
};
