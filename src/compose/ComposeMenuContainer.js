/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import boundActions from '../boundActions';
import ComposeMenu from './ComposeMenu';
import { getActiveNarrow } from '../selectors';

const ConnectedComposeMenu = connectActionSheet(ComposeMenu);

const componentStyles = StyleSheet.create({
  wrapper: {
    height: 44,
  },
});

export default connect(
  state => ({
    narrow: getActiveNarrow(state),
  }),
  boundActions,
)(props => (
  <View style={componentStyles.wrapper}>
    <ConnectedComposeMenu {...props} />
  </View>
));
