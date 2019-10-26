/* @flow strict-local */
import React, { PureComponent } from 'react';

import type { ImageEmojiType, Dispatch } from '../types';
import { connect } from '../react-redux';
import UnicodeEmoji from './UnicodeEmoji';
import ImageEmoji from './ImageEmoji';
import { getActiveImageEmojiByName } from './emojiSelectors';

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
  imageEmoji: getActiveImageEmojiByName(state)[props.name],
}))(Emoji);
