/* @flow strict-local */
import invariant from 'invariant';
import { EVENT_NEW_MESSAGE } from '../actionConstants';
import { makeUserId } from '../api/idTypes';
import store, { restore } from '../boot/store';
import { getStreamsByName } from '../subscriptions/subscriptionSelectors';
import { getOwnUserId } from '../users/userSelectors';
import { AvatarURL } from '../utils/avatar';

const fetchTask = async (taskData: {
  avatar_url: string,
  content: string,
  realm_uri: string,
  recipient_type: 'stream' | 'private',
  sender_email: string,
  sender_full_name: string,
  sender_id: string,
  stream: string,
  time: string,
  topic: string,
  user_id: string,
  zulip_message_id: string,
  ...
}) => {
  restore(() => {
    if (Number(taskData.user_id) !== getOwnUserId(store.getState())) {
      return;
    }

    const stream = getStreamsByName(store.getState()).get(taskData.stream);
    invariant(stream !== undefined, 'Stream cannot be null');

    // TODO this message object is created very roughly
    // and it only works for Streams.
    // TODO make this into a function probably
    //
    // It also isn't equivalent to Message type some
    // attributes are hard coded.
    const message = {
      isOutbox: false,
      sender_domain: taskData.realm_uri,
      avatar_url: AvatarURL.fromUserOrBotData({
        email: taskData.sender_email,
        rawAvatarUrl: taskData.avatar_url,
        realm: new URL(taskData.realm_uri),
        userId: makeUserId(Number(taskData.user_id)),
      }),
      client: 'website',
      content: taskData.content,
      content_type: 'text/markdown',
      // gravatar_hash: '',
      edit_history: [],
      id: Number(taskData.zulip_message_id),
      is_me_message: false,
      reactions: [],
      sender_email: taskData.sender_email,
      sender_full_name: taskData.sender_full_name,
      sender_id: makeUserId(Number(taskData.sender_id)),
      sender_realm_str: taskData.realm_uri,
      // sender_short_name: '',
      timestamp: Number(taskData.time),
      subject: taskData.topic,
      display_recipient: taskData.stream,
      subject_links: [],
      stream_id: stream.stream_id,
      type: 'stream', // taskData.recipient_type,
      flags: [],
    };

    // TODO flow gives error
    store.dispatch({
      type: EVENT_NEW_MESSAGE,
      message,
      caughtUp: store.getState().caughtUp,
      ownUserId: getOwnUserId(store.getState()),
    });
  });
};

export default fetchTask;
