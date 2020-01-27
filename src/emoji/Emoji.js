/* @flow strict-local */
import React, { PureComponent } from 'react';
import { StyleSheet, Image } from 'react-native';
import { createIconSet } from 'react-native-vector-icons';

import type { ImageEmojiType, Dispatch, EmojiType } from '../types';
import { connect } from '../react-redux';
import { getAllImageEmojiByCode } from './emojiSelectors';
import { codeToEmojiMap } from './data';

/* $FlowFixMe: `createIconSet` is mistyped upstream; elements of
  `glyphMap` may be either `number` or `string`. */
const UnicodeEmoji = createIconSet(codeToEmojiMap);

type SelectorProps = {|
  imageEmoji: ImageEmojiType | void,
|};

type Props = $ReadOnly<{|
  type: EmojiType,
  code: string,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

class Emoji extends PureComponent<Props> {
  styles = StyleSheet.create({
    image: { width: 20, height: 20 },
  });

  render() {
    const { code, imageEmoji } = this.props;
    if (imageEmoji) {
      return <Image style={this.styles.image} source={{ uri: imageEmoji.source_url }} />;
    }
    return <UnicodeEmoji name={code} size={20} />;
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  imageEmoji: props.type === 'image' ? getAllImageEmojiByCode(state)[props.code] : undefined,
}))(Emoji);
