/* @flow */
import { connectActionSheet } from '@expo/react-native-action-sheet';

import connectWithActions from '../../connectWithActions';
import MessageHeader from './MessageHeader';
import { getAuth, getSubscriptions } from '../../selectors';

export default connectWithActions((state, props) => ({
  auth: getAuth(state),
  narrow: props.narrow,
  subscriptions: getSubscriptions(state),
}))(connectActionSheet(MessageHeader));
