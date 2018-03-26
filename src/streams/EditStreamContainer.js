/* @flow */
import connectWithActions from '../connectWithActions';
import { getEditStreamScreenParams, getOwnEmail } from '../selectors';
import { getStreamEditInitialValues } from '../subscriptions/subscriptionSelectors';
import EditStreamCard from './EditStreamCard';

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  streamId: getEditStreamScreenParams(state).streamId,
  initialValues: getStreamEditInitialValues(state),
}))(EditStreamCard);
