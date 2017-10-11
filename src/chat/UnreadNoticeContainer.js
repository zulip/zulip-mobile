/* @flow */
import connectWithActions from '../connectWithActions';
import { getUnreadCountInActiveNarrow } from '../selectors';
import UnreadNotice from './UnreadNotice';

export default connectWithActions(state => ({
  unreadCount: getUnreadCountInActiveNarrow(state),
}))(UnreadNotice);
