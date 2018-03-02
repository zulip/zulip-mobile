/* @flow */
import React, { PureComponent } from 'react';
import { ImageBackground, View } from 'react-native';

import type { ChildrenArray } from '../types';
import { nullFunction } from '../nullObjects';
import { Touchable } from './';

import userDefaultAvatar from '../../static/img/user.png';

type Props = {
  avatarUrl: string,
  size: number,
  shape: string,
  children: ChildrenArray<*>,
  onPress: () => void,
};

type State ={
  isLoading: boolean,
};

export default class ImageAvatar extends PureComponent<Props, State> {
  props: Props;

  state: State;

  state = {
    isLoading: true,
  }

  static defaultProps = {
    onPress: nullFunction,
  };

  handleLoad = () => {
    this.setState({ isLoading: false });
  }

  render() {
    const { isLoading } = this.state;
    const { avatarUrl, children, size, shape, onPress } = this.props;
    const touchableStyle = {
      height: size,
      width: size,
    };

    const borderRadius =
      shape === 'rounded' ? size / 8 : shape === 'circle' ? size / 2 : shape === 'square' ? 0 : 0;

    const imageSource = isLoading ? userDefaultAvatar : { uri: avatarUrl };

    return (
      <View>
        <Touchable onPress={onPress} style={touchableStyle}>
          <ImageBackground
            style={touchableStyle}
            source={imageSource}
            resizeMode="cover"
            borderRadius={borderRadius}
            onLoad={this.handleLoad}
          >
            {children}
          </ImageBackground>
        </Touchable>
      </View>
    );
  }
}
