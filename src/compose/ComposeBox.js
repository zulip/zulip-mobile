import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
} from 'react-native';

import SendButton from './SendButton';
import { BORDER_COLOR } from '../common/styles';
import ComposeOptions from './ComposeOptions';

const MIN_HEIGHT = 38;
const MAX_HEIGHT = 200;

const styles = StyleSheet.create({
  outerWrapper: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: '#fff',
  },
  composeWrapper: {
    flex: 1,
    flexDirection: 'column',
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

export default class ComposeBox extends React.Component {

  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      editing: false,
      text: '',
      contentHeight: MIN_HEIGHT,
    };
  }

  handleSend = () => {
    this.props.onSend(this.state.text);
    this.setState({ text: '' });
  }

  handleContentSizeChange = (event) =>
    this.setState({ contentHeight: event.nativeEvent.contentSize.height });

  handleChangeText = (text) =>
    this.setState({ text });

  render() {
    const { contentHeight, text } = this.state;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);

    return (
      <View style={styles.outerWrapper}>
        <View style={styles.composeWrapper}>
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
          <ComposeOptions />
        </View>
        <SendButton disabled={text.length === 0} onPress={this.handleSend} />
      </View>
    );
  }
}
