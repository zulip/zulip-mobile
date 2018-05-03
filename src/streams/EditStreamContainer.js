/* @flow */
import connectWithActions from '../connectWithActions';
import { getOwnEmail } from '../selectors';
import { getStreamEditInitialValues } from '../subscriptions/subscriptionSelectors';
import EditStreamCard from './EditStreamCard';

export default connectWithActions((state, props) => ({
  ownEmail: getOwnEmail(state),
  streamId: props.streamId || -1,
  initialValues: getStreamEditInitialValues(props.streamId)(state),
}))(EditStreamCard);
