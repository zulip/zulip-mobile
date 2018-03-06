/* @flow */
import connectWithActions from '../connectWithActions';
import { getUserInPmNarrow } from '../selectors';
import TitlePrivate from './TitlePrivate';

export default connectWithActions((state, props) => ({
  user: getUserInPmNarrow(props.narrow)(state),
}))(TitlePrivate);
