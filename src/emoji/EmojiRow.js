/* @flow strict-local */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import type { GlobalState, ImageEmojiType } from '../types';
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

type OwnProps = {|
  name: string,
  onPress: (name: string) => void,
|};

type StateProps = {|
  imageEmoji: ImageEmojiType | void,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
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

export default connect((state: GlobalState, props: OwnProps) => ({
  imageEmoji: getActiveImageEmojiByName(state)[props.name],
}))(EmojiRow);
