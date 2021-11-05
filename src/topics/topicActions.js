/* @flow strict-local */
import type { Narrow, Topic, PerAccountAction, ThunkAction, Outbox } from '../types';
import * as api from '../api';
import { INIT_TOPICS } from '../actionConstants';
import { isStreamNarrow, streamNameOfNarrow } from '../utils/narrow';
import { getAuth, getStreams } from '../selectors';
import { deleteOutboxMessage } from '../actions';
import { getOutbox } from '../directSelectors';

export const initTopics = (topics: Topic[], streamId: number): PerAccountAction => ({
  type: INIT_TOPICS,
  topics,
  streamId,
});

export const fetchTopics = (streamId: number): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const auth = getAuth(getState());
  const { topics } = await api.getTopics(auth, streamId);
  dispatch(initTopics(topics, streamId));
};

export const fetchTopicsForStream = (narrow: Narrow): ThunkAction<Promise<void>> => async (
  dispatch,
  getState,
) => {
  const state = getState();

  if (!isStreamNarrow(narrow)) {
    return;
  }
  const streamName = streamNameOfNarrow(narrow);

  const streams = getStreams(state);
  // TODO (#4333): Look for the stream by its ID, not its name.
  const stream = streams.find(sub => streamName === sub.name);
  if (!stream) {
    return;
  }
  dispatch(fetchTopics(stream.stream_id));
};

export const deleteMessagesForTopic = (
  streamId: number,
  topic: string,
): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  const state = getState();
  const outbox = getOutbox(state);

  outbox.forEach((outboxMessage: Outbox) => {
    if (
      outboxMessage.type === 'stream'
      && outboxMessage.stream_id === streamId
      && outboxMessage.subject === topic
    ) {
      dispatch(deleteOutboxMessage(outboxMessage.id));
    }
  });
  await api.deleteTopic(getAuth(state), streamId, topic);
};
