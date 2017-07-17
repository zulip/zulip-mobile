/* @flow */
import React, { PureComponent } from 'react';
import { Image, StyleSheet } from 'react-native';

import { nullFunction } from '../nullObjects';
import { Touchable } from './';
import UserStatusIndicator from '../common/UserStatusIndicator';

const componentStyles = StyleSheet.create({
  status: {
    marginLeft: 21,
    marginTop: 21,
  },
});

export default class ImageAvatar extends PureComponent {
  props: {
    avatarUrl: string,
    size: number,
    shape: string,
    status?: string,
    onPress?: () => void,
  };

  static defaultProps = {
    onPress: nullFunction,
  };

  render() {
    const { avatarUrl, size, shape, onPress, status } = this.props;
    const touchableStyle = {
      height: size,
      width: size,
    };

    const imageStyle = {
      ...touchableStyle,
      borderRadius:
        shape === 'rounded' ? size / 8 : shape === 'circle' ? size / 2 : shape === 'square' ? 0 : 0,
    };

    return (
      <Touchable onPress={onPress} style={touchableStyle}>
        <Image style={imageStyle} source={{ uri: avatarUrl }} resizeMode="contain">
          {status && <UserStatusIndicator style={componentStyles.status} status={status} />}
        </Image>
      </Touchable>
    );
  }
}
