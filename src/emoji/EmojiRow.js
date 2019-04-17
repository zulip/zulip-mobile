/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ImageEmojiType, Dispatch } from '../types';
import { connect } from '../react-redux';
import { RawLabel, Touchable } from '../common';
import Emoji from './Emoji';
import ImageEmoji from './ImageEmoji';
import { getActiveImageEmojiByName } from './emojiSelectors';

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

type SelectorProps = {|
  imageEmoji: ImageEmojiType | void,
|};

type Props = {|
  name: string,
  onPress: (name: string) => void,

  dispatch: Dispatch,
  ...SelectorProps,
|};

class EmojiRow extends PureComponent<Props> {
  handlePress = () => {
    const { name, onPress } = this.props;
    onPress(name);
  };

  render() {
    const { name, imageEmoji } = this.props;

    // TODO: this only handles Unicode emoji (shipped with the app)
    // and realm emoji, but not Zulip extra emoji.  See our issue #2846.
    return (
      <Touchable onPress={this.handlePress}>
        <View style={styles.emojiRow}>
          {imageEmoji ? <ImageEmoji emoji={imageEmoji} /> : <Emoji name={name} size={20} />}
          <RawLabel style={styles.text} text={name} />
        </View>
      </Touchable>
    );
  }
}

export default connect((state, props): SelectorProps => ({
  imageEmoji: getActiveImageEmojiByName(state)[props.name],
}))(EmojiRow);
