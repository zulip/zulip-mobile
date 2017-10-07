/* @flow */
import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';

import { Label } from '../common';
import { IconDone } from '../common/Icons';

const componentStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: 100,
    backgroundColor: 'green',
  },
});

export default class MarkAsReadQuickAction extends PureComponent {
  render() {
    return (
      <View style={componentStyles.wrapper}>
        <IconDone size={100} color="white" />
        <Label text="Mark as read" />
      </View>
    );
  }
}
