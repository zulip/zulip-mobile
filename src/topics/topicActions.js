/* @flow */
import type { GetState, Actions, Dispatch } from '../types';
import { getTopics } from '../api';
import { INIT_TOPICS } from '../actionConstants';
import { getAuth } from '../selectors';

export const initTopics = (topics: any[]): Actions => ({
  type: INIT_TOPICS,
  topics,
});

export const fetchTopics = (streamId: number): Actions => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  const auth = getAuth(getState());
  const topics = await getTopics(auth, streamId);
  dispatch(initTopics(topics));
};
