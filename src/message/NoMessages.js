/* @flow strict-local */

import React, { PureComponent } from 'react';
import type { Node } from 'react';
import { View } from 'react-native';

import type { Narrow } from '../types';
import { createStyleSheet } from '../styles';
import { ZulipTextIntl } from '../common';

import {
  isHomeNarrow,
  is1to1PmNarrow,
  isGroupPmNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
  isSearchNarrow,
  showComposeBoxOnNarrow,
} from '../utils/narrow';

const styles = createStyleSheet({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    paddingLeft: 10,
    padding: 8,
  },
});

type EmptyMessage = {|
  isFunc: Narrow => boolean,
  text: string,
|};

const messages: $ReadOnlyArray<EmptyMessage> = [
  { isFunc: isHomeNarrow, text: 'No messages on server' },
  { isFunc: isSpecialNarrow, text: 'No messages' },
  { isFunc: isStreamNarrow, text: 'No messages in stream' },
  { isFunc: isTopicNarrow, text: 'No messages with this topic' },
  { isFunc: is1to1PmNarrow, text: 'No messages with this person' },
  { isFunc: isGroupPmNarrow, text: 'No messages in this group' },
  { isFunc: isSearchNarrow, text: 'No messages' },
];

type Props = $ReadOnly<{|
  narrow: Narrow,
|}>;

export default class NoMessages extends PureComponent<Props> {
  render(): Node {
    const { narrow } = this.props;

    const message = messages.find(x => x.isFunc(narrow)) || {};

    return (
      <View style={styles.container}>
        <ZulipTextIntl style={styles.text} text={message.text} />
        {showComposeBoxOnNarrow(narrow) ? (
          <ZulipTextIntl text="Why not start the conversation?" />
        ) : null}
      </View>
    );
  }
}
