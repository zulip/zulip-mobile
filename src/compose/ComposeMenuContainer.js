/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import connectWithActions from '../connectWithActions';
import ComposeMenu from './ComposeMenu';
import { getActiveNarrow } from '../selectors';

const ConnectedComposeMenu = connectActionSheet(ComposeMenu);

const componentStyles = StyleSheet.create({
  wrapper: {
    height: 44,
  },
});

export default connectWithActions(state => ({
  narrow: getActiveNarrow(state),
}))(props => (
  <View style={componentStyles.wrapper}>
    <ConnectedComposeMenu {...props} />
  </View>
));
