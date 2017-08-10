/* @flow */
import parseMarkdown from 'zulip-markdown-parser';

import type { Dispatch, GetState } from '../types';
import { MESSAGE_SEND } from '../actionConstants';
import { getAuth } from '../selectors';
import { sendMessage as sendMessageApi } from '../api';
import { getSelfUserDetail } from '../users/userSelectors';
import { extractTypeToAndSubjectFromNarrow } from '../utils/narrow';

export const sendMessage = (params: Object) => ({
  type: MESSAGE_SEND,
  params,
});

export const trySendMessages = () => (dispatch: Dispatch, getState: GetState) => {
  const state = getState();
  const auth = getAuth(state);

  state.outbox.forEach(item => {
    sendMessageApi(
      auth,
      ...extractTypeToAndSubjectFromNarrow(state.chat.narrow),
      item.content,
      item.timestamp,
      state.app.eventQueueId,
    );
  });
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
  dispatch(
    sendMessage({
      narrow,
      content,
      parsedContent: html,
      timestamp: Math.round(new Date().getTime() / 1000),
      sender_full_name: userDetail.fullName,
      email: userDetail.email,
      avatar_url: userDetail.avatarUrl,
    }),
  );
  dispatch(trySendMessages());
};
