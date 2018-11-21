/* @flow */
import parseMarkdown from 'zulip-markdown-parser';

import { logErrorRemotely } from '../utils/logging';
import type {
  Dispatch,
  GetState,
  GlobalState,
  NamedUser,
  Narrow,
  Outbox,
  User,
  DeleteOutboxMessageAction,
  MessageSendStartAction,
  MessageSendCompleteAction,
  ToggleOutboxSendingAction,
} from '../types';
import {
  MESSAGE_SEND_START,
  TOGGLE_OUTBOX_SENDING,
  DELETE_OUTBOX_MESSAGE,
  MESSAGE_SEND_COMPLETE,
} from '../actionConstants';
import { getActiveAccount } from '../selectors';
import { sendMessage } from '../api';
import { getSelfUserDetail } from '../users/userSelectors';
import { getUserByEmail, getUsersAndWildcards } from '../users/userHelpers';
import { isStreamNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';

export const messageSendStart = (outbox: Outbox): MessageSendStartAction => ({
  type: MESSAGE_SEND_START,
  outbox,
});

export const toggleOutboxSending = (sending: boolean): ToggleOutboxSendingAction => ({
  type: TOGGLE_OUTBOX_SENDING,
  sending,
});

export const deleteOutboxMessage = (localMessageId: number): DeleteOutboxMessageAction => ({
  type: DELETE_OUTBOX_MESSAGE,
  local_message_id: localMessageId,
});

export const messageSendComplete = (localMessageId: number): MessageSendCompleteAction => ({
  type: MESSAGE_SEND_COMPLETE,
  local_message_id: localMessageId,
});

export const trySendMessages = () => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  if (state.outbox.length === 0 || state.session.outboxSending) {
    return;
  }
  dispatch(toggleOutboxSending(true));
  const account = getActiveAccount(state);
  const outboxToSend = state.outbox.filter(outbox => !outbox.isSent);
  outboxToSend.forEach(async item => {
    try {
      await sendMessage(
        account,
        item.type,
        isPrivateOrGroupNarrow(item.narrow) ? item.narrow[0].operand : item.display_recipient,
        item.subject,
        item.markdownContent,
        item.timestamp,
        state.session.eventQueueId,
      );
      dispatch(messageSendComplete(item.timestamp));
    } catch (e) {
      logErrorRemotely(e, 'error caught while sending');
    }
  });
  dispatch(toggleOutboxSending(false));
};

const mapEmailsToUsers = (users, narrow, selfDetail) =>
  narrow[0].operand
    .split(',')
    .map(item => {
      const user = getUserByEmail(users, item);
      return { email: item, id: user.user_id, full_name: user.full_name };
    })
    .concat({ email: selfDetail.email, id: selfDetail.user_id, full_name: selfDetail.full_name });

// TODO type: `string | NamedUser[]` is a bit confusing.
const extractTypeToAndSubjectFromNarrow = (
  narrow: Narrow,
  users: User[],
  selfDetail: { email: string, user_id: number, full_name: string },
): { type: 'private' | 'stream', display_recipient: string | NamedUser[], subject: string } => {
  if (isPrivateOrGroupNarrow(narrow)) {
    return {
      type: 'private',
      display_recipient: mapEmailsToUsers(users, narrow, selfDetail),
      subject: '',
    };
  } else if (isStreamNarrow(narrow)) {
    return { type: 'stream', display_recipient: narrow[0].operand, subject: '(no topic)' };
  }
  return { type: 'stream', display_recipient: narrow[0].operand, subject: narrow[1].operand };
};

const getContentPreview = (content: string, state: GlobalState): string => {
  try {
    return parseMarkdown(
      content,
      getUsersAndWildcards(state.users),
      state.streams,
      getActiveAccount(state),
      state.realm.filters,
      state.realm.emoji,
    );
  } catch (e) {
    return content;
  }
};

export const addToOutbox = (narrow: Narrow, content: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const userDetail = getSelfUserDetail(state);

  const localTime = Math.round(new Date().getTime() / 1000);
  dispatch(
    messageSendStart({
      narrow,
      isSent: false,
      ...extractTypeToAndSubjectFromNarrow(narrow, state.users, userDetail),
      markdownContent: content,
      content: getContentPreview(content, state),
      timestamp: localTime,
      id: localTime,
      sender_full_name: userDetail.full_name,
      sender_email: userDetail.email,
      avatar_url: userDetail.avatar_url,
      isOutbox: true,
      reactions: [],
    }),
  );
  dispatch(trySendMessages());
};
