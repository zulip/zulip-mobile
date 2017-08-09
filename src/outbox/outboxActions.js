/* @flow */
import type { Dispatch, GetState } from '../types';
import { MESSAGE_SEND } from '../actionConstants';
import { getAuth } from '../selectors';
import { sendMessage as sendMessageApi } from '../api';

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
      item.type,
      item.to,
      item.subject,
      item.content,
      item.localMessageId,
      state.app.eventQueueId,
    );
  });
};

export const addToOutbox = (
  type: 'private' | 'stream',
  to: string | string[],
  subject: string,
  content: string,
) => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(sendMessage({ type, to, subject, content, localMessageId: new Date().getTime() }));
  dispatch(trySendMessages());
};
