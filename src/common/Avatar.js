import React from 'react';
import {
  Image,
} from 'react-native';

export default class Avatar extends React.PureComponent {

  props: {
    avatarUrl: string,
    size: number,
  }

  static defaultProps = {
    size: 32,
  };

  render() {
    const { avatarUrl, size } = this.props;
    const style = {
      height: size,
      width: size,
      borderRadius: size / 2,
    };

    return (
      <Image
        style={style}
        source={{ uri: avatarUrl }}
        resizeMode="contain"
      />
    );
  }
}
