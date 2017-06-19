import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Label } from '../common';

import {
  isHomeNarrow,
  isPrivateNarrow,
  isGroupNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
  isSearchNarrow,
} from '../utils/narrow';
import ZulipButton from '../common/ZulipButton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    paddingLeft: 10,
    padding: 8,
    textAlign: 'center',
  },
  button: {
    paddingLeft: 8,
    paddingRight: 8,
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
    const { narrow, notSubscribed, subscribeStream, showSubscribeButton } = this.props;
    const message = messages.find(x => x.isFunc(narrow));
    let displayNotice = message.text;
    if (notSubscribed) {
      displayNotice = `You aren't subscribed to this stream and ${message.text}`;
    }
    const { container, text, button } = styles;
    return (
      <View style={container}>
        <Label style={text} text={displayNotice} />
        <Label text="Why not start the conversation?" />
        {notSubscribed && showSubscribeButton &&
          <ZulipButton
            customStyles={button}
            secondary
            text="Subscribe"
            onPress={subscribeStream}
          />}
      </View>
    );
  }
}
