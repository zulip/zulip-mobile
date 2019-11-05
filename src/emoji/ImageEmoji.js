/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';

import type { ImageEmojiType } from '../types';

type Props = {|
  emoji: ImageEmojiType,
|};

export default class ImageEmoji extends PureComponent<Props> {
  styles = StyleSheet.create({
    image: {
      width: 20,
      height: 20,
    },
  });

  render() {
    const { emoji } = this.props;
    return <Image style={this.styles.image} source={{ uri: emoji.source_url }} />;
  }
}
