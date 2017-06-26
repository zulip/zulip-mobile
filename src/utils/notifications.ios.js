/* @flow */
import NotificationsIOS from 'react-native-notifications';
import type { Auth } from '../types';
import registerPush from '../api/registerPush';

const register = async (auth: Auth, deviceToken: string) => {
  await registerPush(auth, deviceToken);
};

const onPushRegistered = (auth: Auth, deviceToken: string, saveTokenPush: (arg: string) => any) => {
  console.log('Device Token Received', auth, deviceToken);
  register(auth, deviceToken);
  saveTokenPush(deviceToken);
};

const onPushRegistrationFailed = (error: string) => {
  console.error('pushNotification', error);
};

export const initializeNotifications = (auth: Auth, saveTokenPush: (arg: string) => any) => {
  NotificationsIOS.addEventListener('remoteNotificationsRegistered', (deviceToken) => onPushRegistered(auth, deviceToken, saveTokenPush));
  NotificationsIOS.addEventListener('remoteNotificationsRegistrationFailed', onPushRegistrationFailed.bind(null, auth));
  NotificationsIOS.requestPermissions();
};

export const refreshNotificationToken = () => {
};
