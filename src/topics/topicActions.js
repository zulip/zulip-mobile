/* @flow */
import type { GetState, Actions, Dispatch } from '../types';
import { getTopics } from '../api';
import { INIT_TOPICS } from '../actionConstants';
import { NULL_STREAM } from '../nullObjects';
import { isStreamNarrow } from '../utils/narrow';
import { getAuth, getActiveNarrow, getStreams } from '../selectors';

export const initTopics = (topics: any[], streamId: number): Actions => ({
  type: INIT_TOPICS,
  topics,
  streamId,
});

export const fetchTopics = (streamId: number): Actions => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const topics = await getTopics(auth, streamId);
  dispatch(initTopics(topics, streamId));
};

export const fetchTopicsForActiveStream = (): Actions => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const state = getState();
  const narrow = getActiveNarrow(state);

  if (!isStreamNarrow(narrow)) {
    return;
  }

  const streams = getStreams(state);
  const stream = streams.find(sub => narrow[0].operand === sub.name) || NULL_STREAM;

  dispatch(fetchTopics(stream.stream_id));
};
