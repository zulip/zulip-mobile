/* @flow */
import connectWithActions from '../connectWithActions';
import { getCurrentRouteParams, getOwnEmail } from '../selectors';
import { getStreamEditInitialValues } from '../subscriptions/subscriptionSelectors';
import EditStreamCard from './EditStreamCard';

export default connectWithActions(state => ({
  ownEmail: getOwnEmail(state),
  streamId: getCurrentRouteParams(state) && getCurrentRouteParams(state).streamId,
  initialValues: getStreamEditInitialValues(state),
}))(EditStreamCard);
