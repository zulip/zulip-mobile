/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';

import type { RealmEmojiType } from '../types';

const styles = StyleSheet.create({
  image: {
    width: 20,
    height: 20,
  },
});

type Props = {
  realmEmoji: RealmEmojiType,
};

export default class RealmEmoji extends PureComponent<Props> {
  props: Props;

  render() {
    const { realmEmoji } = this.props;

    if (!realmEmoji) return null;

    return <Image style={styles.image} source={{ uri: realmEmoji.source_url }} />;
  }
}
