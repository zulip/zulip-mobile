/* @flow */
import type { GetState, Actions, Dispatch } from '../types';
import { getStreams } from '../api';
import { INIT_STREAMS } from '../actionConstants';
import { getAuth } from '../account/accountSelectors';

export const initStreams = (streams: any[]): Actions => ({
  type: INIT_STREAMS,
  streams,
});

export const fetchStreams = (): Actions => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initStreams(await getStreams(getAuth(getState()))));
