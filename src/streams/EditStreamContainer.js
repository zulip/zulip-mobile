/* @flow */
import connectWithActions from '../connectWithActions';
import { getStreamEditInitialValues } from '../subscriptions/subscriptionSelectors';
import EditStreamCard from './EditStreamCard';

export default connectWithActions(state => ({
  initialValues: getStreamEditInitialValues(state),
}))(EditStreamCard);
