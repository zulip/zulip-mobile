/* @flow */
import React from 'react';
import { StyleSheet } from 'react-native';

import { Touchable } from '../common';
import { IconPlus } from '../common/Icons';
import { executeActionSheetAction, constructActionButtons } from './composeActionSheet';

const componentStyles = StyleSheet.create({
  touchable: {},
  button: {
    padding: 10,
    color: '#999',
  },
});

export default class ComposeMenu extends React.Component {
  handlePress = () => {
    const { narrow } = this.props;
    const options = constructActionButtons({
      narrow,
    });
    const callback = buttonIndex => {
      executeActionSheetAction({
        title: options[buttonIndex],
        actions: this.props.actions,
      });
    };

    this.props.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      callback,
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
