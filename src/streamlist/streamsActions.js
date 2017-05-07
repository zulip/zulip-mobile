import { getStreams } from '../api';
import {
  INIT_STREAMS,
} from '../actionConstants';

export const initStreams = (streams) => ({
  type: INIT_STREAMS,
  streams,
});

export const fetchStreams = (auth) =>
  async (dispatch) =>
    dispatch(initStreams(await getStreams(auth)));
