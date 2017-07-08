/* @flow */
import type { Auth, Actions, Dispatch } from '../types';
import { getStreams } from '../api';
import {
  INIT_STREAMS,
} from '../actionConstants';

export const initStreams = (streams: any[]): Actions => ({
  type: INIT_STREAMS,
  streams,
});

export const fetchStreams = (auth: Auth): Actions =>
  async (dispatch: Dispatch) =>
    dispatch(initStreams(await getStreams(auth)));
