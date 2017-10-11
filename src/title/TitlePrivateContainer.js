/* @flow */
import connectWithActions from '../connectWithActions';
import { getUserInPmNarrow } from '../selectors';
import TitlePrivate from './TitlePrivate';

export default connectWithActions(state => ({
  user: getUserInPmNarrow(state),
}))(TitlePrivate);
