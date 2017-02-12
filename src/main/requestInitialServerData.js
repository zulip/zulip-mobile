import { homeNarrow, specialNarrow } from '../utils/narrow';
import { focusPing } from '../api';

export default ({
  auth,
  fetchEvents,
  fetchStreams,
  fetchSubscriptions,
  fetchUsersAndStatus,
  backgroundFetchMessages,
  fetchMessages,
}) => {
  fetchSubscriptions(auth);
  fetchMessages(auth, Number.MAX_SAFE_INTEGER, 20, 0, homeNarrow());
  fetchStreams(auth);
  fetchEvents(auth);
  fetchUsersAndStatus(auth);
  backgroundFetchMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, specialNarrow('private'));
  focusPing(auth, true, false);
};
