/* @flow strict-local */
import type { GetState, Dispatch, Message, Narrow, Topic, Action, Outbox, Stream } from '../types';
import * as api from '../api';
import { INIT_TOPICS } from '../actionConstants';
import { isStreamNarrow } from '../utils/narrow';
import { getAuth, getStreams } from '../selectors';
import { deleteOutboxMessage } from '../actions';
import { getOutbox } from '../directSelectors';

export const initTopics = (topics: Topic[], streamId: number): Action => ({
  type: INIT_TOPICS,
  topics,
  streamId,
});

export const fetchTopics = (streamId: number) => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { topics } = await api.getTopics(auth, streamId);
  dispatch(initTopics(topics, streamId));
};

export const fetchTopicsForActiveStream = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();

  if (!isStreamNarrow(narrow)) {
    return;
  }

  const streams = getStreams(state);
  const stream = streams.find(sub => narrow[0].operand === sub.name);
  if (!stream) {
    return;
  }
  dispatch(fetchTopics(stream.stream_id));
};

export const deleteMessagesForTopic = (narrow: Narrow, message: Message | Outbox) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const outbox = getOutbox(state);
  outbox.forEach((outboxMessage: Outbox) => {
    if (
      outboxMessage.display_recipient === narrow[0].operand
      && outboxMessage.subject === narrow[1].operand
    ) {
      dispatch(deleteOutboxMessage(outboxMessage.id));
    }
  });
  const currentStream: Stream | void = getStreams(state).find(
    (stream: Stream) => stream.name === message.display_recipient,
  );
  if (currentStream) {
    await api.deleteTopic(getAuth(state), currentStream.stream_id, narrow[1].operand);
  }
};
