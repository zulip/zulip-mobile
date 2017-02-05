import { homeNarrow, specialNarrow } from '../utils/narrow';
import { focusPing } from '../api';

export default ({
  auth,
  fetchEvents,
  fetchUsersAndStatus,
  backgroundFetchMessages,
  fetchMessages,
}) => {
  fetchEvents(auth);
  fetchUsersAndStatus(auth);
  fetchMessages(auth, Number.MAX_SAFE_INTEGER, 20, 0, homeNarrow(), [true, true]);
  backgroundFetchMessages(auth, Number.MAX_SAFE_INTEGER, 100, 0, specialNarrow('private'));
  focusPing(auth, true, false);
};
