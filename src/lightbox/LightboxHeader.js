/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { Action, StyleObj } from '../types';
import { Avatar, Touchable } from '../common';
import Icon from '../common/Icons';

const componentStyles = StyleSheet.create({
  text: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  name: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subheader: {
    color: 'white',
    fontSize: 12,
  },
  rightIcon: {
    fontSize: 36,
    alignSelf: 'center',
  },
  wrapper: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 0,
  },
});

type Props = {
  senderName: string,
  subheader: string,
  timestamp: number,
  from: number,
  to: number,
  style: StyleObj,
  avatarUrl: string,
  realm: string,
  onPressBack: () => Action,
};

export default class LightboxHeader extends PureComponent<Props> {
  static contextTypes = {
    styles: () => null,
  };

  render() {
    const { onPressBack, senderName, subheader, ...restProps } = this.props;

    return (
      <View style={componentStyles.wrapper}>
        <Avatar size={36} {...restProps} />
        <View style={componentStyles.text}>
          <Text style={componentStyles.name} numberOfLines={1}>
            {senderName}
          </Text>
          <Text style={componentStyles.subheader} numberOfLines={1}>
            {subheader}
          </Text>
        </View>
        <Touchable onPress={onPressBack}>
          <Icon style={componentStyles.rightIcon} color="white" name="x" />
        </Touchable>
      </View>
    );
  }
}
