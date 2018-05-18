/* @flow */
import parseMarkdown from 'zulip-markdown-parser';

import { logErrorRemotely } from '../utils/logging';
import type {
  Dispatch,
  GetState,
  NamedUser,
  Narrow,
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
import { getAuth } from '../selectors';
import { sendMessage } from '../api';
import { getSelfUserDetail } from '../users/userSelectors';
import { getUserByEmail, getUsersAndWildcards } from '../users/userHelpers';
import { isStreamNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';

export const messageSendStart = (outbox: Object): MessageSendStartAction => ({
  type: MESSAGE_SEND_START,
  outbox,
});

export const toggleOutboxSending = (sending: boolean): ToggleOutboxSendingAction => ({
  type: TOGGLE_OUTBOX_SENDING,
  sending,
});

export const deleteOutboxMessage = (localMessageId: number): DeleteOutboxMessageAction => ({
  type: DELETE_OUTBOX_MESSAGE,
  localMessageId,
});

export const messageSendComplete = (localMessageId: number): MessageSendCompleteAction => ({
  type: MESSAGE_SEND_COMPLETE,
  localMessageId,
});

export const trySendMessages = () => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  if (state.outbox.length > 0 && !state.session.outboxSending) {
    dispatch(toggleOutboxSending(true));
    const auth = getAuth(state);
    state.outbox.forEach(async item => {
      try {
        await sendMessage(
          auth,
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
  }
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

export const addToOutbox = (narrow: Narrow, content: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const userDetail = getSelfUserDetail(state);
  const { users, streams, realm } = state;
  const auth = getAuth(state);
  const html = parseMarkdown(
    content,
    getUsersAndWildcards(users),
    streams,
    auth,
    realm.filters,
    realm.emoji,
  );
  const localTime = Math.round(new Date().getTime() / 1000);
  dispatch(
    messageSendStart({
      narrow,
      ...extractTypeToAndSubjectFromNarrow(narrow, users, userDetail),
      markdownContent: content,
      content: html,
      timestamp: localTime,
      id: localTime,
      sender_full_name: userDetail.full_name,
      sender_email: userDetail.email,
      avatar_url: userDetail.avatar_url,
      isOutbox: true,
    }),
  );
  dispatch(trySendMessages());
};
