/* @flow */
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';

import { Label } from '../common';
import connectWithActions from '../connectWithActions';
import { getPresence, getUnreadConversations, getUsersByEmail } from '../selectors';
import ConversationList from './ConversationList';

const styles = StyleSheet.create({
  label: {
    marginTop: 8,
    marginLeft: 4,
    marginBottom: 4,
  },
});

const { height } = Dimensions.get('window');

export default connectWithActions(state => ({
  conversations: getUnreadConversations(state),
  presences: getPresence(state),
  usersByEmail: getUsersByEmail(state),
  maxHeight: height / 2,
  listLabel: <Label style={styles.label} text="Private Messages" />,
}))(props => <ConversationList {...props} />);
