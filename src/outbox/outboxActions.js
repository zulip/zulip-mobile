/* @flow */
import type { Dispatch, GetState } from '../types';
import { MESSAGE_SEND } from '../actionConstants';
import { getAuth } from '../selectors';
import { trySendMessages } from './outboxMessageActions';

export const sendMessageAction = (params: Object) => ({
  type: MESSAGE_SEND,
  params,
});

export const addToOutbox = (
  type: 'private' | 'stream',
  to: string | string[],
  subject: string,
  content: string,
) => async (dispatch: Dispatch, getState: GetState) => {
  dispatch(sendMessageAction({ type, to, subject, content, localMessageId: new Date().getTime() }));
  const { outbox, app } = getState();
  const auth = getAuth(getState());
  trySendMessages({ outbox, eventQueueId: app.eventQueueId, auth });
};
