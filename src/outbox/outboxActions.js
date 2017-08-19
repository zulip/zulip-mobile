/* @flow */
import parseMarkdown from 'zulip-markdown-parser';

import type { Dispatch, GetState, Narrow } from '../types';
import {
  MESSAGE_SEND,
  START_OUTBOX_SENDING,
  FINISHED_OUTBOX_SENDING,
  DELETE_OUTBOX_MESSAGE,
} from '../actionConstants';
import { getAuth } from '../selectors';
import { sendMessage as sendMessageApi } from '../api';
import { getSelfUserDetail } from '../users/userSelectors';
import { extractTypeToAndSubjectFromNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';

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

export const trySendMessages = () => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  if (state.outbox.length > 0 && !state.app.outboxSending) {
    dispatch(toggleOutboxSending(true));
    const auth = getAuth(state);
    state.outbox.forEach(async item => {
      await sendMessageApi(
        auth,
        item.type,
        isPrivateOrGroupNarrow(item.narrow) ? item.narrow[0].operand : item.display_recipient,
        item.subject,
        item.content,
        item.timestamp,
        state.app.eventQueueId,
      );
    });
    dispatch(toggleOutboxSending(false));
  }
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
      ...extractTypeToAndSubjectFromNarrow(narrow, users),
      content,
      parsedContent: html,
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
