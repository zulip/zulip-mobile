import {homeNarrow, specialNarrow} from '../utils/narrow';
import {INITIAL_DATA_FETCH} from '../constants';
import {focusPing} from '../api';
import {
  fetchSubscriptions,
  fetchMessages,
  fetchStreams,
  fetchEvents,
  fetchUsersAndStatus,
  backgroundFetchMessages,
} from '../actions';

export default auth =>
  dispatch => {
    dispatch({type: INITIAL_DATA_FETCH});
    [
      fetchSubscriptions(auth),
      fetchMessages(auth, 0, 10, 10, homeNarrow(), true),
      fetchStreams(auth),
      fetchEvents(auth),
      fetchUsersAndStatus(auth),
      backgroundFetchMessages(
        auth,
        Number.MAX_SAFE_INTEGER,
        100,
        0,
        specialNarrow('private')
      ),
    ].map(dispatch);
    focusPing(auth, true, false);
  };
