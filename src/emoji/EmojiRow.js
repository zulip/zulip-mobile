/* @flow */
import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';

import { RawLabel, Touchable } from '../common';
import Emoji from '../emoji/Emoji';
import RealmEmoji from './RealmEmoji';
import type { RealmEmojiType } from '../types';

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
  onPress: () => void,
};

export default class EmojiRow extends Component<Props> {
  props: Props;

  render() {
    const { name, realmEmoji, onPress } = this.props;

    return (
      <Touchable onPress={onPress}>
        <View style={styles.emojiRow}>
          {realmEmoji ? <RealmEmoji name={name} /> : <Emoji name={name} size={20} />}
          <RawLabel style={styles.text} text={name} />
        </View>
      </Touchable>
    );
  }
}
