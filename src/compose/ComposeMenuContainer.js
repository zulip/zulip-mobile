/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { connectActionSheet, ActionSheetProvider } from '@expo/react-native-action-sheet';

import { getAuth } from '../selectors';
import boundActions from '../boundActions';
import ComposeMenu from './ComposeMenu';

const ConnectedComposeMenu = connectActionSheet(ComposeMenu);

const componentStyles = StyleSheet.create({
  wrapper: {
    height: 44,
  },
});

export default connect(
  state => ({
    auth: getAuth(state),
    isHydrated: state.app.isHydrated,
    needsInitialFetch: state.app.needsInitialFetch,
  }),
  boundActions,
)(props =>
  <View style={componentStyles.wrapper}>
    <ActionSheetProvider>
      <ConnectedComposeMenu {...props} />
    </ActionSheetProvider>
  </View>,
);
