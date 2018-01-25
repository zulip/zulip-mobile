/* @flow */
import { connectActionSheet } from '@expo/react-native-action-sheet';

import connectWithActions from '../../connectWithActions';
import MessageHeader from './MessageHeader';
import { getAuth, getActiveNarrow, getSubscriptions } from '../../selectors';

export default connectWithActions(state => ({
  auth: getAuth(state),
  narrow: getActiveNarrow(state),
  subscriptions: getSubscriptions(state),
}))(connectActionSheet(MessageHeader));
