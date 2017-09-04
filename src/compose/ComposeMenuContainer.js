/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { connectActionSheet } from '@expo/react-native-action-sheet';

import boundActions from '../boundActions';
import ComposeMenu from './ComposeMenu';

const ConnectedComposeMenu = connectActionSheet(ComposeMenu);

const componentStyles = StyleSheet.create({
  wrapper: {
    height: 44,
  },
});

export default connect(null, boundActions)(props => (
  <View style={componentStyles.wrapper}>
    <ConnectedComposeMenu {...props} />
  </View>
));
