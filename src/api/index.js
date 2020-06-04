/* @flow strict-local */

/**
 * The code here in src/api is like a self-contained, independent
 * library that describes the server API. Therefore, it shouldn't
 * import code from outside src/api. We've made a few exceptions to
 * this rule -- we sometimes import functions from src/utils for
 * convenience -- but we're generally pretty consistent about it.
 */

import queueMarkAsRead from './queueMarkAsRead';
import checkCompatibility from './checkCompatibility';
import devFetchApiKey from './devFetchApiKey';
import devListUsers from './devListUsers';
import fetchApiKey from './fetchApiKey';
import reportPresence from './reportPresence';
import getTopics from './getTopics';
import toggleMessageStarred from './messages/toggleMessageStarred';
import typing from './typing';
import pollForEvents from './pollForEvents';
import registerForEvents from './registerForEvents';
import uploadFile from './uploadFile';
import emojiReactionAdd from './emoji_reactions/emojiReactionAdd';
import emojiReactionRemove from './emoji_reactions/emojiReactionRemove';
import markAllAsRead from './mark_as_read/markAllAsRead';
import markStreamAsRead from './mark_as_read/markStreamAsRead';
import markTopicAsRead from './mark_as_read/markTopicAsRead';
import deleteMessage from './messages/deleteMessage';
import deleteTopic from './messages/deleteTopic';
import getRawMessageContent from './messages/getRawMessageContent';
import getMessages from './messages/getMessages';
import getMessageHistory from './messages/getMessageHistory';
import messagesFlags from './messages/messagesFlags';
import sendMessage from './messages/sendMessage';
import updateMessage from './messages/updateMessage';
import savePushToken from './notifications/savePushToken';
import forgetPushToken from './notifications/forgetPushToken';
import getServerSettings from './settings/getServerSettings';
import toggleMobilePushSettings from './settings/toggleMobilePushSettings';
import createStream from './streams/createStream';
import getStreams from './streams/getStreams';
import updateStream from './streams/updateStream';
import getSubscriptions from './subscriptions/getSubscriptions';
import subscriptionAdd from './subscriptions/subscriptionAdd';
import subscriptionRemove from './subscriptions/subscriptionRemove';
import toggleMuteStream from './subscriptions/toggleMuteStream';
import togglePinStream from './subscriptions/togglePinStream';
import toggleStreamNotifications from './subscriptions/toggleStreamNotifications';
import getSubscriptionToStream from './subscriptions/getSubscriptionToStream';
import setTopicMute from './subscriptions/setTopicMute';
import tryGetFileTemporaryUrl from './tryGetFileTemporaryUrl';
import getUsers from './users/getUsers';
import createUser from './users/createUser';
import getUserProfile from './users/getUserProfile';
import updateUserStatus from './users/updateUserStatus';
import getFileTemporaryUrl from './messages/getFileTemporaryUrl';

export {
  queueMarkAsRead,
  checkCompatibility,
  devFetchApiKey,
  devListUsers,
  fetchApiKey,
  reportPresence,
  getTopics,
  toggleMessageStarred,
  typing,
  pollForEvents,
  registerForEvents,
  uploadFile,
  emojiReactionAdd,
  emojiReactionRemove,
  markAllAsRead,
  markStreamAsRead,
  markTopicAsRead,
  deleteMessage,
  deleteTopic,
  getRawMessageContent,
  getMessages,
  getMessageHistory,
  messagesFlags,
  sendMessage,
  updateMessage,
  savePushToken,
  forgetPushToken,
  getServerSettings,
  toggleMobilePushSettings,
  createStream,
  getStreams,
  updateStream,
  getSubscriptions,
  setTopicMute,
  subscriptionAdd,
  subscriptionRemove,
  getSubscriptionToStream,
  toggleMuteStream,
  togglePinStream,
  toggleStreamNotifications,
  tryGetFileTemporaryUrl,
  getUsers,
  createUser,
  getUserProfile,
  updateUserStatus,
  getFileTemporaryUrl,
};
