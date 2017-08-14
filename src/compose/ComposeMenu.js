/* @flow */
import React from 'react';
import { StyleSheet } from 'react-native';

import { Touchable } from '../common';
import { IconPlus } from '../common/Icons';

const componentStyles = StyleSheet.create({
  touchable: {},
  button: {
    padding: 10,
    color: '#999',
  },
});

export default class ComposeMenu extends React.Component {
  handlePress = () => {
    this.props.showActionSheetWithOptions(
      {
        options: ['Toggle compose tools', 'Create group', 'Cancel'],
        cancelButtonIndex: 2,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0: {
            const { actions } = this.props;
            actions.toggleComposeTools();
            break;
          }

          case 1: {
            const { actions } = this.props;
            actions.navigateToCreateGroup();
            break;
          }

          default:
            break;
        }
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
