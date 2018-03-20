/* @flow */
import connectWithActions from '../connectWithActions';
import { getPresence, getUserInPmNarrow } from '../selectors';
import TitlePrivate from './TitlePrivate';

export default connectWithActions((state, props) => ({
  presences: getPresence(state),
  user: getUserInPmNarrow(props.narrow)(state),
}))(TitlePrivate);
