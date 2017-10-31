/* @flow */
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { Action, StyleObj } from '../types';
import ModalNavBar from '../nav/ModalNavBar';
import { Avatar } from '../common';

const componentStyles = StyleSheet.create({
  text: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
  name: {
    color: 'white',
    fontSize: 14,
    lineHeight: 14,
  },
  navBar: {
    backgroundColor: 'transparent',
    paddingTop: 0,
    borderBottomWidth: 0,
  },
  subheader: {
    color: 'white',
    fontSize: 12,
  },
  children: {
    justifyContent: 'flex-start',
    paddingRight: 10,
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
      <ModalNavBar
        itemsColor="white"
        rightItem={{
          name: 'x',
          onPress: onPressBack,
          style: { fontSize: 36 },
        }}
        style={componentStyles.navBar}
        childrenStyle={componentStyles.children}
        isRightItemNav
      >
        <Avatar {...restProps} />
        <View style={componentStyles.text}>
          <Text style={[this.context.styles.username, componentStyles.name]} numberOfLines={1}>
            {senderName}
          </Text>
          <Text style={componentStyles.subheader} numberOfLines={1}>
            {subheader}
          </Text>
        </View>
      </ModalNavBar>
    );
  }
}
