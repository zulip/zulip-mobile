/* @flow */
import connectWithActions from '../connectWithActions';
import { getRecipientsInGroupNarrow } from '../selectors';
import TitleGroup from './TitleGroup';

export default connectWithActions(state => ({
  recipients: getRecipientsInGroupNarrow(state),
}))(TitleGroup);
