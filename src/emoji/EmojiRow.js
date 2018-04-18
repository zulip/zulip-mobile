/* @flow */
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import { RawLabel, Touchable } from '../common';
import Emoji from '../emoji/Emoji';
import ImageEmoji from './ImageEmoji';
import type { RealmEmojiType, ZulipExtraEmojiType } from '../types';

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  text: {
    paddingLeft: 6,
  },
});

type Props = {
  name: string,
  realmEmoji: RealmEmojiType,
  zulipExtraEmoji: ZulipExtraEmojiType,
  onPress: () => void,
};

export default class EmojiRow extends Component<Props> {
  props: Props;

  render() {
    const { name, realmEmoji, onPress, zulipExtraEmoji } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={styles.emojiRow}>
          {zulipExtraEmoji ? (
            <ImageEmoji url={zulipExtraEmoji.emoji_url} />
          ) : realmEmoji ? (
            <ImageEmoji url={realmEmoji.source_url} />
          ) : (
            <Emoji name={name} size={20} />
          )}
          <RawLabel style={styles.text} text={name} />
        </View>
      </Touchable>
    );
  }
}
