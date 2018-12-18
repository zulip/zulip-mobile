/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Image } from 'react-native';

import type { GlobalState, RealmEmojiType } from '../types';
import { RawLabel, Touchable } from '../common';
import Emoji from './Emoji';
import RealmEmoji from './RealmEmoji';
import { getActiveRealmEmojiByName } from './emojiSelectors';

const zulipLogo = require('../../static/img/zulip-logo.png');

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  text: {
    paddingLeft: 6,
  },
  image: {
    width: 20,
    height: 20,
  },
});

type Props = {|
  name: string,
  realmEmoji: RealmEmojiType | void,
  onPress: (name: string) => void,
|};

class EmojiRow extends PureComponent<Props> {
  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { name, realmEmoji } = this.props;

    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.emojiRow}>
          {realmEmoji ? (
            <RealmEmoji emoji={realmEmoji} />
          ) : name === 'zulip' ? (
            <Image style={styles.image} source={zulipLogo} />
          ) : (
            <Emoji name={name} size={20} />
          )}
          <RawLabel style={styles.text} text={name} />
        </View>
      </Touchable>
    );
  }
}

export default connect((state: GlobalState, props) => ({
  realmEmoji: getActiveRealmEmojiByName(state)[props.name],
}))(EmojiRow);
