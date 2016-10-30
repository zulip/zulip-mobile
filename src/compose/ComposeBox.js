import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
} from 'react-native';

import SendButton from './SendButton';
import { BORDER_COLOR } from '../common/styles';
import ThreadBox from './ThreadBox';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    backgroundColor: '#fff',
  },
  messageBox: {
    flex: 1,
    flexDirection: 'row',
  },
  composeInput: {
    flex: 1,
    padding: 8,
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
    };
  }

  handleSend = () =>
    this.props.onSubmit(this.props.text);

  handleChangeText = (text) =>
    this.setState({ text });

  render() {
    const { text } = this.state;
    const composeBoxHeight = { height: 44 };

    return (
      <View style={styles.container}>
        {this.state.editing && <ThreadBox />}
        <View style={[styles.messageBox, composeBoxHeight]}>
          <TextInput
            style={styles.composeInput}
            multiline
            onChangeText={this.handleChangeText}
            placeholder="Type a message here"
          />
          {text.length > 0 &&
            <SendButton onPress={this.handleSend} />}
        </View>
      </View>
    );
  }
}
