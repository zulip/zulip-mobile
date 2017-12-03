/* @flow */
import type { GetState, Actions, Dispatch } from '../types';
import { createStream, getStreams } from '../api';
import { INIT_STREAMS } from '../actionConstants';
import { getAuth } from '../selectors';

export const initStreams = (streams: any[]): Actions => ({
  type: INIT_STREAMS,
  streams,
});

export const fetchStreams = (): Actions => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initStreams(await getStreams(getAuth(getState()))));

export const createNewStream = (
  name: string,
  description: string,
  principals: string[],
  isPrivate: boolean,
): Actions => async (dispatch: Dispatch, getState: GetState) => {
  await createStream(getAuth(getState()), name, description, principals, isPrivate);
};
