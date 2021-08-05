/* @flow strict-local */
import { NativeModules } from 'react-native';

import store, { restore } from '../boot/store';
import * as api from '../api';
import { getAuth } from '../selectors';
import * as logging from '../utils/logging';
import { getOwnUser } from '../users/userSelectors';

const replyTask = async (taskData: {
  reply: string,
  sendTo: string,
  topic: string,
  type: string,
  conversationKey: string,
  ...
}): Promise<void> => {
  restore(() => {
    const message =
      taskData.type === 'private'
        ? {
            content: taskData.reply,
            type: 'private',
            // todo fix this
            to: taskData.sendTo,
          }
        : {
            content: taskData.reply,
            type: 'stream',
            subject: taskData.topic,
            to: taskData.sendTo,
          };
    const auth = getAuth(store.getState());
    try {
      api.sendMessage(auth, message);
    } catch (err) {
      logging.error(err);
      return;
    }
    const { Notifications } = NativeModules;
    Notifications.updateNotification(
      getOwnUser(store.getState()).avatar_url,
      taskData.conversationKey,
      taskData.reply,
    );
  });
};

const replyTaskProvider = () => replyTask;

export default replyTaskProvider;
