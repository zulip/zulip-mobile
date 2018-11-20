/* @flow */
import type { GetState, Dispatch, Narrow, Topic, InitTopicsAction } from '../types';
import { getTopics } from '../api';
import { INIT_TOPICS } from '../actionConstants';
import { isStreamNarrow } from '../utils/narrow';
import { getActiveAccount, getStreams } from '../selectors';

export const initTopics = (topics: Topic[], streamId: number): InitTopicsAction => ({
  type: INIT_TOPICS,
  topics,
  streamId,
});

export const fetchTopics = (streamId: number) => async (dispatch: Dispatch, getState: GetState) => {
  const auth = getActiveAccount(getState());
  const topics = await getTopics(auth, streamId);
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
