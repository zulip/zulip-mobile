import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
  isSearchNarrow,
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
    backgroundColor: 'white',
  }
});

const messages = [
  { isFunc: isHomeNarrow, text: 'No messages on server' },
  { isFunc: isSpecialNarrow, text: 'No messages' },
  { isFunc: isStreamNarrow, text: 'No messages in stream' },
  { isFunc: isTopicNarrow, text: 'No messages with this topic' },
  { isFunc: isPrivateNarrow, text: 'No messages with this person' },
  { isFunc: isGroupNarrow, text: 'No messages in this group' },
  { isFunc: isSearchNarrow, text: 'No messages' },
];

export default class NoMessages extends React.PureComponent {

  render() {
    const { narrow } = this.props;
    const message = messages.find(x => x.isFunc(narrow));
    const { container, text } = styles;

    return (
      <View style={container}>
        <Text style={text}>{message.text}</Text>
        <Text>Why not start the conversation?</Text>
      </View>
    );
  }
}
