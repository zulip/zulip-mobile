/* @flow */
import connectWithActions from '../connectWithActions';
import { getActiveNarrow, getUnreadStreamsAndTopics } from '../selectors';
import UnreadListRoot from './UnreadListRoot';

export default connectWithActions(state => ({
  narrow: getActiveNarrow(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopics(state),
}))(UnreadListRoot);
