import React from 'react';
import { Image, StyleSheet, Touchable } from 'react-native';

import { getResource } from '../../utils/url';

const styles = StyleSheet.create({
  img: {
    width: 296,
    height: 150,
  },
  emoji: {
    width: 20,
    height: 20,
  },
});

export default class HtmlText extends React.PureComponent {
  render() {
    const { auth, src, className, onPress } = this.props;
    const source = getResource(src, auth);

    return (
      <Touchable onPress={onPress}>
        <Image
          source={source}
          resizeMode={className === 'emoji' ? 'cover' : 'contain'}
          style={className === 'emoji' ? styles.emoji : styles.img}
        />
      </Touchable>
    );
  }
}
