/* @flow */
import React from 'react';
import { StyleSheet, View, ScrollView, TextInput } from 'react-native';

import { Auth, Narrow, User } from '../types';
import { Input } from '../common';
import { isStreamNarrow, isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { registerUserInputActivity } from '../utils/activity';
import sendMessage from '../api/sendMessage';
import SendButton from './SendButton';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';

const MIN_HEIGHT = 38;
const MAX_HEIGHT = 200;

const componentStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  messageBox: {
    flex: 1,
  },
});

type Props = {
  auth: Auth,
  narrow: Narrow,
  operator: string,
  users: User[],
  text: string,
  handleChangeText: (input: string) => void,
};

export default class ComposeText extends React.Component {

  static contextTypes = {
    styles: () => null,
  };

  props: Props;
  textInput: TextInput;

  state: {
    editing: boolean,
    autocomplete: boolean,
    contentHeight: number,
  }

  state = {
    editing: false,
    autocomplete: false,
    contentHeight: MIN_HEIGHT,
  };

  handleSend = () => {
    const { auth, narrow, operator, text } = this.props;

    if (isPrivateOrGroupNarrow(narrow)) {
      sendMessage(auth, 'private', narrow[0].operand, '', text);
    } else if (isTopicNarrow(narrow) || isStreamNarrow(narrow)) {
      if (operator !== null) {
        sendMessage(auth, 'stream', narrow[0].operand,
        (operator === '') ? '(no topic)' : operator, text);
      } else if (isTopicNarrow(narrow)) {
        sendMessage(auth, 'stream', narrow[0].operand, narrow[1].operand, text);
      } else if (isStreamNarrow(narrow)) {
        sendMessage(auth, 'stream', narrow[0].operand, '(no topic)', text);
      }
    }


    this.clearInput();
  }

  clearInput = () => {
    this.textInput.clear();
    this.setState({
      contentHeight: MIN_HEIGHT,
    });
    this.props.handleChangeText('');
  }

  handleOnChange = (event: Object) =>
    this.setState({ contentHeight: event.nativeEvent.contentSize.height });

  handleChangeText = (text: string) => {
    const { auth, handleChangeText } = this.props;
    registerUserInputActivity(auth);
    handleChangeText(text);
  }

  render() {
    const { narrow, auth, users, text } = this.props;
    const { contentHeight } = this.state;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);
    const placeholder = getComposeInputPlaceholder(narrow, auth.email, users);

    return (
      <View style={componentStyles.wrapper}>
        <ScrollView style={{ height }} contentContainerStyle={componentStyles.messageBox}>
          <Input
            value={text}
            style={this.context.styles.composeText}
            textInputRef={component => { this.textInput = component; }}
            multiline
            underlineColorAndroid="transparent"
            height={contentHeight}
            onChange={this.handleOnChange}
            onChangeText={this.handleChangeText}
            placeholder={placeholder}
          />
        </ScrollView>
        <SendButton
          disabled={text.length === 0}
          onPress={this.handleSend}
        />
      </View>
    );
  }
}
