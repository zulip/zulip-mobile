import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';

import {
  isHomeNarrow,
  isSpecialNarrow,
  isStreamNarrow,
  isTopicNarrow,
  isPrivateNarrow,
  isGroupNarrow,
} from '../utils/narrow';
import { Input } from '../common';
import { getAuth } from '../account/accountSelectors';
import sendMessage from '../api/sendMessage';
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
    paddingLeft: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 80,
  },
});

type Props = {
  auth: Object,
  narrow: Object,
};

class ComposeText extends React.Component {

  props: Props;

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
    const { auth, narrow } = this.props;
    const { text } = this.state;

    if (isPrivateNarrow(narrow) || isGroupNarrow(narrow)) {
      sendMessage(auth, 'private', narrow[0].operand, '', text);
    } else if (isStreamNarrow(narrow)) {
      sendMessage(auth, 'stream', narrow[0].operand, '(no topic)', text);
    } else if (isTopicNarrow(narrow)) {
      sendMessage(auth, 'stream', narrow[0].operand, narrow[1].operand, text);
    }

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
    const { narrow } = this.props;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);
    const lastword = text.match(/\b(\w+)$/);
    const lastWordPrefix = lastword && lastword.index && text[lastword.index - 1];
    const canSendToCurrentNarrow = isHomeNarrow(narrow) && isSpecialNarrow(narrow);

    return (
      <View style={styles.wrapper}>
        {lastWordPrefix === ':' &&
          <EmojiAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '#' &&
          <StreamAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        {lastWordPrefix === '@' &&
          <PeopleAutocomplete filter={lastword[0]} onAutocomplete={this.handleAutocomplete} />}
        <ScrollView style={[styles.messageBox, { height }]}>
          <Input
            customStyle={[styles.composeInput]}
            blurOnSubmit
            defaultValue={text}
            multiline
            underlineColorAndroid="transparent"
            returnKeyType="send"
            height={contentHeight}
            onContentSizeChange={this.handleContentSizeChange}
            onChangeText={this.handleChangeText}
            onSubmitEditing={this.handleSend}
            placeholder="Type a message here"
          />
        </ScrollView>
        <SendButton
          disabled={text.length === 0 || canSendToCurrentNarrow}
          onPress={this.handleSend}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: getAuth(state),
  narrow: state.chat.narrow,
});

export default connect(mapStateToProps)(ComposeText);
