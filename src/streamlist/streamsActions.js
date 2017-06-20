/* @flow */
import { Auth, Dispatch } from '../types';
import { getStreams } from '../api';
import {
  INIT_STREAMS,
} from '../actionConstants';

export const initStreams = (streams: any[]) => ({
  type: INIT_STREAMS,
  streams,
});

export const fetchStreams = (auth: Auth) =>
  async (dispatch: Dispatch) =>
    dispatch(initStreams(await getStreams(auth)));
