/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';
import { createIconSet } from 'react-native-vector-icons';

import type { ImageEmojiType, Dispatch } from '../types';
import { connect } from '../react-redux';
import { nameToEmojiMap } from './data';
import { getAllImageEmojiByName } from './emojiSelectors';

/* $FlowFixMe: `nameToEmojiMap` is mistyped upstream; elements of
  `glyphMap` may be either `number` or `string`. */
const UnicodeEmoji = createIconSet(nameToEmojiMap, 'AppleColorEmoji');

class ImageEmoji extends PureComponent<{|
  emoji: ImageEmojiType,
|}> {
  styles = StyleSheet.create({
    image: { width: 20, height: 20 },
  });

  render() {
    const { emoji } = this.props;
    return <Image style={this.styles.image} source={{ uri: emoji.source_url }} />;
  }
}

type SelectorProps = {|
  imageEmoji: ImageEmojiType | void,
|};

type Props = {|
  name: string,

  dispatch: Dispatch,
  ...SelectorProps,
|};

class Emoji extends PureComponent<Props> {
  render() {
    const { name, imageEmoji } = this.props;

    // TODO: this only handles Unicode emoji (shipped with the app)
    // and realm emoji, but not Zulip extra emoji.  See our issue #2846.
    return imageEmoji ? <ImageEmoji emoji={imageEmoji} /> : <UnicodeEmoji name={name} size={20} />;
  }
}

export default connect((state, props): SelectorProps => ({
  imageEmoji: getAllImageEmojiByName(state)[props.name],
}))(Emoji);
