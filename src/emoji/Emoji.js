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
const UnicodeEmoji = createIconSet(nameToEmojiMap);

type SelectorProps = {|
  imageEmoji: ImageEmojiType | void,
|};

type Props = $ReadOnly<{|
  name: string,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

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

export default connect<SelectorProps, _, _>((state, props) => ({
  imageEmoji: getAllImageEmojiByName(state)[props.name],
}))(Emoji);
