/* @flow */
import connectWithActions from '../connectWithActions';
import { getPresence, getUserInPmNarrow } from '../selectors';
import TitlePrivate from './TitlePrivate';

export default connectWithActions((state, props) => ({
  user: getUserInPmNarrow(props.narrow)(state),
  presence: getPresence(state),
}))(TitlePrivate);
