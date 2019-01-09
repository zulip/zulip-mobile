/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';

import type { ImageEmojiType } from '../types';

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
  },
});

type Props = {|
  emoji: ImageEmojiType,
|};

export default class RealmEmoji extends PureComponent<Props> {
  render() {
    const { emoji } = this.props;
    return <Image style={styles.image} source={{ uri: emoji.source_url }} />;
  }
}
