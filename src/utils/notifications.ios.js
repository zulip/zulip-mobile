/* TODO: flow */
import NotificationsIOS from 'react-native-notifications';
import type { Auth } from '../types';
import registerPush from '../api/registerPush';
import { logErrorRemotely } from './logging';

const register = async (auth: Auth, deviceToken: string) => {
  await registerPush(auth, deviceToken);
};

const onPushRegistered = (auth: Auth, deviceToken: string, saveTokenPush: (arg: string) => any) => {
  console.log('Device Token Received', auth, deviceToken); // eslint-disable-line
  register(auth, deviceToken);
  saveTokenPush(deviceToken);
};

const onPushRegistrationFailed = (error: string) => {
  logErrorRemotely(new Error(error), 'register ios push token failed');
};

export const initializeNotifications = (auth: Auth, saveTokenPush: (arg: string) => any) => {
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
