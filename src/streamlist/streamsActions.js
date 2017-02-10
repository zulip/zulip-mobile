import { getStreams } from '../api';
import {
  INIT_STREAMS,
} from '../constants';

export const fetchStreams = (auth) =>
  async (dispatch) => {
    const response = await getStreams(auth);
    dispatch({
      type: INIT_STREAMS,
      streams: response,
    });
  };
