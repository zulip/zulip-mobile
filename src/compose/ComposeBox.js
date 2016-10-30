import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
} from 'react-native';

import SendButton from './SendButton';
import { BORDER_COLOR } from '../common/styles';
import ThreadBox from './ThreadBox';

const MIN_HEIGHT = 38;
const MAX_HEIGHT = 200;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: '#fff',
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
  onSubmit: () => undefined,
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

  handleSend = () =>
    this.props.onSubmit(this.props.text);

  handleContentSizeChange = (event) =>
    this.setState({ contentHeight: event.nativeEvent.contentSize.height });

  handleChangeText = (text) =>
    this.setState({ text });

  render() {
    const { contentHeight, text } = this.state;
    const height = Math.min(Math.max(MIN_HEIGHT, contentHeight), MAX_HEIGHT);

    return (
      <View style={styles.container}>
        {this.state.editing && <ThreadBox />}
        <ScrollView style={[styles.messageBox, { height }]}>
          <TextInput
            style={[styles.composeInput]}
            multiline
            height={contentHeight}
            onContentSizeChange={this.handleContentSizeChange}
            onChangeText={this.handleChangeText}
            placeholder="Type a message here"
          />
        </ScrollView>
        <SendButton disabled={text.length === 0} onPress={this.handleSend} />
      </View>
    );
  }
}
