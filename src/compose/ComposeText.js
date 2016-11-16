import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
} from 'react-native';

import SendButton from './SendButton';
import getAutocompletedText from '../autocomplete/getAutocompletedText';
import EmojiAutocomplete from '../autocomplete/EmojiAutocomplete';
import StreamAutocomplete from '../autocomplete/StreamAutocomplete';
import PeopleAutocomplete from '../autocomplete/PeopleAutocomplete';

const MIN_HEIGHT = 38;
const MAX_HEIGHT = 200;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
  },
  messageBox: {
    flex: 1,
  },
  composeInput: {
    flex: 1,
    padding: 4,
    fontSize: 16,
  },
  sendButton: {
    width: 80,
  },
});

type Props = {
  onSend: (content: string) => undefined,
};

export default class ComposeText extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      editing: false,
      text: '',
      auocomplete: false,
      contentHeight: MIN_HEIGHT,
    };
  }

  handleSend = () => {
    this.props.onSend(this.state.text);
    this.setState({ text: '' });
  }

  handleContentSizeChange = (event) =>
    this.setState({ contentHeight: event.nativeEvent.contentSize.height });

  handleChangeText = (text: string) =>
    this.setState({ text });

  handleAutocomplete = (autocomplete: string) =>
    this.setState(prevState => ({
      text: getAutocompletedText(prevState.text, autocomplete),
    }));

  render() {
    const { contentHeight, text } = this.state;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);
    const lastword = text.match(/\b(\w+)$/);
    const lastWordPrefix = lastword && lastword.index && text[lastword.index - 1];

    return (
      <View style={styles.wrapper}>
        {lastWordPrefix === ':' &&
          <EmojiAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '#' &&
          <StreamAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '@' &&
          <PeopleAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        <ScrollView style={[styles.messageBox, { height }]}>
          <TextInput
            style={[styles.composeInput]}
            blurOnSubmit
            defaultValue={text}
            multiline
            returnKeyType="send"
            height={contentHeight}
            onContentSizeChange={this.handleContentSizeChange}
            onChangeText={this.handleChangeText}
            onSubmitEditing={this.handleSend}
            placeholder="Type a message here"
          />
        </ScrollView>
        <SendButton disabled={text.length === 0} onPress={this.handleSend} />
      </View>
    );
  }
}
