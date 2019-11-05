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

type SelectorProps = {|
  imageEmoji: ImageEmojiType | void,
|};

type Props = {|
  name: string,

  dispatch: Dispatch,
  ...SelectorProps,
|};

// TODO: this only handles Unicode emoji (shipped with the app)
// and realm emoji, but not Zulip extra emoji.  See our issue #2846.
class Emoji extends PureComponent<Props> {
  styles = StyleSheet.create({
    image: { width: 20, height: 20 },
  });

  render() {
    const { name, imageEmoji } = this.props;
    if (imageEmoji) {
      return <Image style={this.styles.image} source={{ uri: imageEmoji.source_url }} />;
    }
    return <UnicodeEmoji name={name} size={20} />;
  }
}

export default connect((state, props): SelectorProps => ({
  imageEmoji: getAllImageEmojiByName(state)[props.name],
}))(Emoji);
