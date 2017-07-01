import NotificationsIOS from 'react-native-notifications';
import registerPush from '../api/registerPush';

const register = async (auth, deviceToken) => {
  await registerPush(auth, deviceToken);
};

const onPushRegistered = (auth, deviceToken, saveTokenPush) => {
  console.log('Device Token Received', auth, deviceToken);
  register(auth, deviceToken);
  saveTokenPush(deviceToken);
};

const onPushRegistrationFailed = (error) => {
  console.error('pushNotification', error);
};

export const initializeNotifications = (auth, saveTokenPush) => {
  NotificationsIOS.addEventListener('remoteNotificationsRegistered', (deviceToken) => onPushRegistered(auth, deviceToken, saveTokenPush));
  NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', onPushRegistrationFailed.bind(null, auth));
  NotificationsIOS.requestPermissions();
};

export const refreshNotificationToken = () => {
};
