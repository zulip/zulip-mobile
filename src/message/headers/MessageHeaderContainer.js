/* @flow */
import { connect } from 'react-redux';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import MessageHeader from './MessageHeader';
import boundActions from '../../boundActions';
import { getAuth, getActiveNarrow, getSubscriptions } from '../../selectors';

export default connect(
  state => ({
    auth: getAuth(state),
    narrow: getActiveNarrow(state),
    subscriptions: getSubscriptions(state),
    mute: state.mute,
  }),
  boundActions,
)(connectActionSheet(MessageHeader));
