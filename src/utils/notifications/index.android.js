/* @flow */
import { NotificationsAndroid, PendingNotifications } from 'react-native-notifications';

import registerGCM from '../../api/registerGCM';
import { streamNarrow, privateNarrow } from '../../utils/narrow';
import { Auth } from '../../types';


const handlePendingNotifications = async (doNarrow) => {
  const notification = await PendingNotifications.getInitialNotification();
  if (notification) {
    const data = notification.getData();
    console.log('Opened app by notification', data); //eslint-disable-line
    if (data.recipient_type === 'stream') {
      doNarrow(streamNarrow(data.stream, data.topic));
    } else if (data.recipient_type === 'private') {
      doNarrow(privateNarrow(data.sender_email));
    }
  }
};

const handleRegistrationUpdates = (auth, saveTokenGCM) => {
  NotificationsAndroid.setRegistrationTokenUpdateListener(async (deviceToken) => {
    try {
      await registerGCM(auth, deviceToken);
    } catch (e) {
        console.log('error ', e); //eslint-disable-line
    }
    saveTokenGCM(deviceToken);
  });
};

export default (auth: Auth, saveTokenGCM, doNarrow) => {
  handlePendingNotifications(doNarrow);
  handleRegistrationUpdates(auth, saveTokenGCM);
};
