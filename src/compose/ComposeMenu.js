/* @flow */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connectActionSheet, ActionSheetProvider } from '@expo/react-native-action-sheet';

import { Touchable } from '../common';
import { IconPlus } from '../common/Icons';

const componentStyles = StyleSheet.create({
  wrapper: {
    height: 44,
  },
  touchable: {},
  button: {
    padding: 10,
    color: '#999',
  },
});

class ComposeMenu extends React.Component {
  handlePress = () => {
    this.props.showActionSheetWithOptions(
      {
        options: ['Hide topic edit', 'Create group', 'Upload image', 'Cancel'],
        cancelButtonIndex: 3,
      },
      buttonIndex => {
        // Do something here depending on the button index selected
      },
    );
  };

  render() {
    return (
      <Touchable style={componentStyles.touchable} onPress={this.handlePress}>
        <IconPlus style={componentStyles.button} size={24} />
      </Touchable>
    );
  }
}

const ConnectedComposeMenu = connectActionSheet(ComposeMenu);

export default () =>
  <View style={componentStyles.wrapper}>
    <ActionSheetProvider>
      <ConnectedComposeMenu />
    </ActionSheetProvider>
  </View>;
