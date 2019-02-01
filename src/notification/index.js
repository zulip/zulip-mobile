/* @flow */
import { DeviceEventEmitter, NativeModules, Platform, PushNotificationIOS } from 'react-native';
import NotificationsIOS, { NotificationsAndroid } from 'react-native-notifications';

import type { Auth, Dispatch, Notification, NotificationGroup, UserIdMap } from '../types';
import { HOME_NARROW, topicNarrow, privateNarrow, groupNarrow } from '../utils/narrow';
import config from '../config';
import { forgetPushToken } from '../api';
import { logErrorRemotely } from '../utils/logging';
import { doNarrow } from '../message/messagesActions';
import { unackPushToken, gotPushToken, sendAllPushToken } from './notificationActions';
import { identityOfAuth } from '../account/accountMisc';

const getGroupNarrowFromNotificationData = (data: NotificationGroup, usersById: UserIdMap = {}) => {
  const userIds = data.pm_users.split(',');
  const users = userIds.map(id => usersById[id]);
  const doAllUsersExist = users.every(user => user);

  return doAllUsersExist ? groupNarrow(users.map(user => user.email)) : HOME_NARROW;
};

export const getNarrowFromNotificationData = (data: ?Notification, usersById: UserIdMap = {}) => {
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

// exported for tests
export const extractNotificationData = (notification: Object): Notification | null => {
  if (!notification || !notification.getData) {
    return null;
  }
  const data = notification.getData();
  return data && data.zulip ? data.zulip : data;
};

const handleNotification = (data: ?Notification, dispatch: Dispatch, usersById: UserIdMap) => {
  if (!data) {
    return;
  }
  config.startup.notification = data;
  dispatch(doNarrow(getNarrowFromNotificationData(data, usersById)));
};

export const handleNotificationMuddle = (
  notification: Object,
  dispatch: Dispatch,
  usersById: UserIdMap,
) => {
  const data = extractNotificationData(notification);
  handleNotification(data, dispatch, usersById);
};

export const handleInitialNotification = async (dispatch: Dispatch, usersById: UserIdMap) => {
  if (Platform.OS === 'android') {
    const { Notifications } = NativeModules;
    const data = await Notifications.getInitialNotification();
    handleNotification(data, dispatch, usersById);
  } else {
    const notification = await PushNotificationIOS.getInitialNotification();
    handleNotificationMuddle(notification, dispatch, usersById);
  }
};

/**
 * Listens for notification-related events.
 *
 * An instance of this doesn't affect the subscriptions of any other
 * instance, or anything else.
 */
export class NotificationListener {
  dispatch: Dispatch;
  usersById: UserIdMap;
  unsubs: Array<() => void> = [];

  constructor(dispatch: Dispatch, usersById: UserIdMap) {
    this.dispatch = dispatch;
    this.usersById = usersById;
  }

  /** Private. */
  listen(name: string, handler: (...empty) => void | Promise<void>) {
    if (Platform.OS === 'ios') {
      NotificationsIOS.addEventListener(name, handler);
      this.unsubs.push(() => NotificationsIOS.removeEventListener(name, handler));
    }
    const subscription = DeviceEventEmitter.addListener(name, handler);
    this.unsubs.push(() => subscription.remove());
  }

  /** Private. */
  unlistenAll() {
    while (this.unsubs.length > 0) {
      this.unsubs.pop()();
    }
  }

  /** Private. */
  handleNotificationOpen = (notification: Object) => {
    handleNotificationMuddle(notification, this.dispatch, this.usersById);
  };

  /** Private. */
  handleDeviceToken = async (deviceToken: string) => {
    this.dispatch(gotPushToken(deviceToken));
    await this.dispatch(sendAllPushToken());
  };

  /** Start listening.  Don't call twice without intervening `stop`. */
  start() {
    if (Platform.OS === 'ios') {
      this.listen('notificationOpened', this.handleNotificationOpen);
    } else {
      this.listen('notificationOpened', notification =>
        this.handleNotificationOpen({ getData: () => notification }),
      );
    }
    this.listen('remoteNotificationsRegistered', this.handleDeviceToken);
    if (Platform.OS === 'ios') {
      this.listen('remoteNotificationsRegistrationFailed', (error: string) => {
        logErrorRemotely(new Error(error), 'Failed to register iOS push token');
      });
    }
  }

  /** Stop listening. */
  stop() {
    this.unlistenAll();
  }
}

/** Try to cause a `remoteNotificationsRegistered` event. */
export const getNotificationToken = () => {
  if (Platform.OS === 'ios') {
    // This leads to a call (in wix's, or RN upstream's, NotificationsIOS) to this:
    //   https://developer.apple.com/documentation/uikit/uiapplication/1622932-registerusernotificationsettings
    // (deprecated after iOS 10, yikes!); which after possibly prompting the
    // user causes "the app" (i.e. the platform part) to call this, I think,
    // though I haven't successfully traced all the steps there:
    //   https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623022-application?language=objc
    // which certainly in the wix case leads to a call to this:
    //   https://developer.apple.com/documentation/uikit/uiapplication/1623078-registerforremotenotifications
    // which "initiate[s] the registration process with [APNs]".  Then the
    // methods that calls on success/failure in turn are implemented to send
    // an event with name `remoteNotificationsRegistered` etc., in both the
    // wix and RN-upstream case.  (Though NB in the *failure* case, the
    // event names differ!  wix has s/Error/Failed/ vs. upstream; also
    // upstream has singular for failure although plural for success, ouch.)
    //
    // In short, this kicks off a sequence: permissions -> "register" ->
    // send event we already have a global listener for.  And the first two
    // steps satisfy the stern warnings in Apple's docs (at the above links)
    // to request permissions first, then "register".
    NotificationsIOS.requestPermissions();
  } else {
    // Platform.OS === 'android'
    NotificationsAndroid.refreshToken();
  }
};

export const tryStopNotifications = async (
  auth: Auth,
  token: string | null,
  dispatch: Dispatch,
) => {
  if (token !== null) {
    dispatch(unackPushToken(identityOfAuth(auth)));
    try {
      await forgetPushToken(auth, Platform.OS, token);
    } catch (e) {
      logErrorRemotely(e, 'failed to unregister Push token');
    }
  }
};
