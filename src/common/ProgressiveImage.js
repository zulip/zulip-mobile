/* @flow strict-local */
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

import type { Style } from '../types';
import { BRAND_COLOR } from '../styles';

const styles = StyleSheet.create({
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  container: {
    backgroundColor: BRAND_COLOR,
  },
});

/**
 * Renders image thumbnail till full image is fetched.
 *
 * @prop thumbnailSource - string url of the thumbnail.
 * @prop source - string url of the image to be loaded.
 * @prop [style] - Style object for additional customization.
 */

type Props = {
  thumbnailSource: string,
  source: string,
  style?: Style,
};

export default class ProgressiveImage extends React.PureComponent<Props> {
  thumbnailAnimated = new Animated.Value(0);
  imageAnimated = new Animated.Value(0);

  handleThumbnailLoad = () => {
    Animated.timing(this.thumbnailAnimated, {
      toValue: 1,
    }).start();
  };

  onImageLoad = () => {
    Animated.timing(this.imageAnimated, {
      toValue: 1,
    }).start();
  };

  render() {
    const { thumbnailSource, source, style, ...props } = this.props;

    return (
      <View style={styles.container}>
        <Animated.Image
          {...props}
          source={{ uri: thumbnailSource }}
          style={[style, { opacity: this.thumbnailAnimated }]}
          onLoad={this.handleThumbnailLoad}
          blurRadius={1}
        />
        <Animated.Image
          {...props}
          source={{ uri: source }}
          style={[styles.imageOverlay, { opacity: this.imageAnimated }, style]}
          onLoad={this.onImageLoad}
        />
      </View>
    );
  }
}
