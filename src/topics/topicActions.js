/* @flow strict-local */
import type { GetState, Dispatch, Narrow, Topic, Action, Outbox } from '../types';
import * as api from '../api';
import { INIT_TOPICS } from '../actionConstants';
import { isStreamNarrow, streamNameOfNarrow } from '../utils/narrow';
import { getAuth, getStreams, getStreamsById } from '../selectors';
import { deleteOutboxMessage } from '../actions';
import { getOutbox } from '../directSelectors';
import { streamNameOfStreamMessage } from '../utils/recipient';

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

export const fetchTopicsForStream = (narrow: Narrow) => async (
  dispatch: Dispatch,
  getState: GetState,
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

export const deleteMessagesForTopic = (streamId: number, topic: string) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const outbox = getOutbox(state);
  const stream = getStreamsById(state).get(streamId);

  outbox.forEach((outboxMessage: Outbox) => {
    if (
      outboxMessage.type === 'stream'
      // TODO: Use StreamId here (see #M3918) when `Outbox` starts
      // having that property (see #M3998).
      && streamNameOfStreamMessage(outboxMessage) === stream?.name
      && outboxMessage.subject === topic
    ) {
      dispatch(deleteOutboxMessage(outboxMessage.id));
    }
  });
  await api.deleteTopic(getAuth(state), streamId, topic);
};
