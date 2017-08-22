/* @flow */
import parseMarkdown from 'zulip-markdown-parser';

import type { Dispatch, GetState, Narrow, User } from '../types';
import {
  MESSAGE_SEND,
  START_OUTBOX_SENDING,
  FINISHED_OUTBOX_SENDING,
  DELETE_OUTBOX_MESSAGE,
  MESSAGE_SEND_SUCCESS,
} from '../actionConstants';
import { getAuth } from '../selectors';
import { sendMessage as sendMessageApi } from '../api';
import { getSelfUserDetail, getUserByEmail } from '../users/userSelectors';
import { isStreamNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';

export const sendMessage = (params: Object) => ({
  type: MESSAGE_SEND,
  params,
});

export const toggleOutboxSending = (sending: boolean): {} => ({
  type: sending ? START_OUTBOX_SENDING : FINISHED_OUTBOX_SENDING,
});

export const deleteOutboxMessage = (localMessageId: number) => ({
  type: DELETE_OUTBOX_MESSAGE,
  localMessageId,
});

export const messageSuccessfulSend = (localMessageId: number) => ({
  type: MESSAGE_SEND_SUCCESS,
  localMessageId,
});

export const trySendMessages = () => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  if (state.outbox.length > 0 && !state.app.outboxSending) {
    dispatch(toggleOutboxSending(true));
    const auth = getAuth(state);
    state.outbox.forEach(async item => {
      try {
        await sendMessageApi(
          auth,
          item.type,
          isPrivateOrGroupNarrow(item.narrow) ? item.narrow[0].operand : item.display_recipient,
          item.subject,
          item.markdownContent,
          item.timestamp,
          state.app.eventQueueId,
        );
        dispatch(messageSuccessfulSend(item.timestamp));
      } catch (e) {
        console.log('error caught while sending', e); // eslint-disable-line
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
      return { email: item, id: user.id, full_name: user.fullName };
    })
    .concat({ email: selfDetail.email, id: selfDetail.id, full_name: selfDetail.fullName });

const extractTypeToAndSubjectFromNarrow = (
  narrow: Narrow,
  users: User[],
  selfDetail: {},
): { type: 'private' | 'stream', display_recipient: string, subject: string } => {
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

  const html = parseMarkdown(content, users, streams, auth, realm.realm_filter, realm.realm_emoji);
  const localTime = Math.round(new Date().getTime() / 1000);
  dispatch(
    sendMessage({
      narrow,
      ...extractTypeToAndSubjectFromNarrow(narrow, users, userDetail),
      markdownContent: content,
      content: html,
      timestamp: localTime,
      id: localTime,
      sender_full_name: userDetail.fullName,
      email: userDetail.email,
      avatar_url: userDetail.avatarUrl,
      isOutbox: true,
    }),
  );
  dispatch(trySendMessages());
};
