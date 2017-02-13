import { homeNarrow, specialNarrow } from '../utils/narrow';
import { INITIAL_DATA_FETCH } from '../constants';
import {
  fetchSubscriptions,
  fetchMessages,
  fetchStreams,
  fetchEvents,
  fetchUsersAndStatus,
  backgroundFetchMessages,
} from '../actions';

export default (auth) =>
  async (dispatch) => {
    dispatch({ type: INITIAL_DATA_FETCH });
    [
      fetchSubscriptions(auth),
      fetchMessages(auth, Number.MAX_SAFE_INTEGER, 20, 0, homeNarrow()),
      fetchStreams(auth),
      fetchEvents(auth),
      fetchUsersAndStatus(auth),
      backgroundFetchMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, specialNarrow('private')),
    ].map(dispatch);
  };
