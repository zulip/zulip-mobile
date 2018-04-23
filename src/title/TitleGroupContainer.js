/* @flow */
import connectWithActions from '../connectWithActions';
import { getRecipientsInGroupNarrow } from '../selectors';
import TitleGroup from './TitleGroup';

export default connectWithActions((state, props) => ({
  recipients: getRecipientsInGroupNarrow(props.narrow)(state),
}))(TitleGroup);
