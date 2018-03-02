/* @flow */
import React from 'react';
import { StyleSheet } from 'react-native';

import { Label } from '../common';
import connectWithActions from '../connectWithActions';
import { getActiveNarrow, getUnreadStreamsAndTopics } from '../selectors';
import UnreadStreamsCard from './UnreadStreamsCard';

const styles = StyleSheet.create({
  label: {
    marginTop: 8,
    marginLeft: 4,
    marginBottom: 4,
  },
});

export default connectWithActions(state => ({
  narrow: getActiveNarrow(state),
  unreadStreamsAndTopics: getUnreadStreamsAndTopics(state),
  listLabel: <Label style={styles.label} text="STREAMS" />,
}))(UnreadStreamsCard);
