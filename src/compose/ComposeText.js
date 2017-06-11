/* @flow */
import React from 'react';
import { StyleSheet, View, ScrollView, TextInput } from 'react-native';

import styles from '../styles';
import { MatchResult } from '../types';
import { Input } from '../common';
import { isStreamNarrow, isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { registerUserInputActivity } from '../utils/activity';
import sendMessage from '../api/sendMessage';
import SendButton from './SendButton';
import getAutocompletedText from '../autocomplete/getAutocompletedText';
import EmojiAutocomplete from '../autocomplete/EmojiAutocomplete';
import StreamAutocomplete from '../autocomplete/StreamAutocomplete';
import PeopleAutocomplete from '../autocomplete/PeopleAutocomplete';

const MIN_HEIGHT = 38;
const MAX_HEIGHT = 200;

const componentStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  messageBox: {
    flex: 1,
  },
});

type Props = {
  auth: Object,
  narrow: Object,
  operator: string | null
};

export default class ComposeText extends React.Component {

  props: Props;
  textInput: TextInput;

  state: {
    editing: boolean,
    text: string,
    autocomplete: boolean,
    contentHeight: number,
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      editing: false,
      text: '',
      autocomplete: false,
      contentHeight: MIN_HEIGHT,
    };
  }

  handleSend = () => {
    const { auth, narrow, operator } = this.props;
    const { text } = this.state;

    if (isPrivateOrGroupNarrow(narrow)) {
      if (typeof operator === 'object' && operator !== null) {
        sendMessage(auth, 'private', operator.email.join(','), '', text);
      } else {
        sendMessage(auth, 'private', narrow[0].operand, '', text);
      }
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
      text: '',
      contentHeight: MIN_HEIGHT,
    });
  }

  handleOnChange = (event: Object) =>
    this.setState({ contentHeight: event.nativeEvent.contentSize.height });

  handleChangeText = (text: string) => {
    const { auth } = this.props;
    registerUserInputActivity(auth);
    this.setState({ text });
  }

  handleAutocomplete = (autocomplete: string | Object) => {
    if (typeof autocomplete === 'object') autocomplete = autocomplete.fullName;
    const text = getAutocompletedText(this.state.text, autocomplete);
    this.textInput.setNativeProps({ text });
    this.setState({ text });
  }

  render() {
    const { contentHeight, text } = this.state;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);
    const lastword: MatchResult = text.match(/\b(\w+)$/);
    const lastWordPrefix = lastword && lastword.index && text[lastword.index - 1];
    return (
      <View>
        {lastWordPrefix === ':' && lastword &&
          <EmojiAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '#' && lastword &&
          <StreamAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '@' && lastword &&
          <PeopleAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        <View style={componentStyles.wrapper}>
          <ScrollView style={{ height }} contentContainerStyle={componentStyles.messageBox}>
            <Input
              style={styles.composeText}
              textInputRef={component => { this.textInput = component; }}
              multiline
              underlineColorAndroid="transparent"
              height={contentHeight}
              onChange={this.handleOnChange}
              onChangeText={this.handleChangeText}
              placeholder="Type a message here"
            />
          </ScrollView>
          <SendButton
            disabled={text.length === 0}
            onPress={this.handleSend}
          />
        </View>
      </View>
    );
  }
}
