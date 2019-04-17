/* @flow strict-local */

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Narrow, Dispatch } from '../types';
import { connect } from '../react-redux';
import { getIfNoMessages, getShowMessagePlaceholders } from '../selectors';
import { Label } from '../common';

import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
  isSearchNarrow,
  canSendToNarrow,
} from '../utils/narrow';

const styles = StyleSheet.create({
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

const messages: EmptyMessage[] = [
  { isFunc: isHomeNarrow, text: 'No messages on server' },
  { isFunc: isSpecialNarrow, text: 'No messages' },
  { isFunc: isStreamNarrow, text: 'No messages in stream' },
  { isFunc: isTopicNarrow, text: 'No messages with this topic' },
  { isFunc: isPrivateNarrow, text: 'No messages with this person' },
  { isFunc: isGroupNarrow, text: 'No messages in this group' },
  { isFunc: isSearchNarrow, text: 'No messages' },
];

type SelectorProps = {|
  showMessagePlaceholders: boolean,
  noMessages: boolean,
|};

type Props = {|
  narrow: Narrow,

  dispatch: Dispatch,
  ...SelectorProps,
|};

class NoMessages extends PureComponent<Props> {
  render() {
    const { noMessages, showMessagePlaceholders, narrow } = this.props;

    if (!noMessages || showMessagePlaceholders) {
      return null;
    }

    const message = messages.find(x => x.isFunc(narrow)) || {};

    return (
      <View style={styles.container}>
        <Label style={styles.text} text={message.text} />
        {canSendToNarrow(narrow) ? <Label text="Why not start the conversation?" /> : null}
      </View>
    );
  }
}

export default connect((state, props): SelectorProps => ({
  showMessagePlaceholders: getShowMessagePlaceholders(props.narrow)(state),
  noMessages: getIfNoMessages(props.narrow)(state),
}))(NoMessages);
