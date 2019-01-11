/* @flow strict-local */
import type { GetState, Dispatch, Narrow, Topic, Action } from '../types';
import { getTopics } from '../api';
import { INIT_TOPICS } from '../actionConstants';
import { isStreamNarrow } from '../utils/narrow';
import { getAuth, getStreams } from '../selectors';

export const initTopics = (topics: Topic[], streamId: number): Action => ({
  type: INIT_TOPICS,
  topics,
  streamId,
});

export const fetchTopics = (streamId: number) => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getAuth(getState());
  const { topics } = await getTopics(auth, streamId);
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
