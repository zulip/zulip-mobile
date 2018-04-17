/* @flow */
import connectWithActions from '../connectWithActions';
import { getRecipientsInGroupNarrow, getPresence } from '../selectors';
import TitleGroup from './TitleGroup';

export default connectWithActions((state, props) => ({
  recipients: getRecipientsInGroupNarrow(props.narrow)(state),
  presence: getPresence(state),
}))(TitleGroup);
