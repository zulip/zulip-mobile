/* @flow */
import connectWithActions from '../connectWithActions';
import { getActiveNarrow, getUnreadStreamsAndTopics } from '../selectors';
import UnreadStreamsCard from './UnreadStreamsCard';

export default connectWithActions(state => ({
  narrow: getActiveNarrow(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopics(state),
}))(UnreadStreamsCard);
