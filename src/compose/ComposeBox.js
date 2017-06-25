/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

import type { Auth, Narrow, GlobalState, EditMessage, User } from '../types';
import boundActions from '../boundActions';
import { Input, MultilineInput } from '../common';
import { isStreamNarrow, isTopicNarrow, isPrivateOrGroupNarrow } from '../utils/narrow';
import { getAuth, getLastTopicInActiveNarrow } from '../selectors';
import ComposeMenu from './ComposeMenu';
import SubmitButton from './SubmitButton';
import AutoCompleteView from '../autocomplete/AutoCompleteView';
import sendMessage from '../api/sendMessage';
import getComposeInputPlaceholder from './getComposeInputPlaceholder';
import { registerUserInputActivity } from '../utils/activity';

const MIN_HEIGHT = 46;
const MAX_HEIGHT = 100;

const componentStyles = StyleSheet.create({
  bottom: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  composeText: {
    flex: 1,
    flexDirection: 'column',
  },
  topic: {
    height: 30,
    backgroundColor: 'rgba(127, 127, 127, 0.25)',
  },
});

class ComposeBox extends PureComponent {
  topicInput = null;
  messageInput = null;

  static contextTypes = {
    styles: () => null,
  };

  props: {
    auth: Auth,
    narrow: Narrow,
    users: User[],
    editMessage: EditMessage,
  };

  state: {
    optionSelected: number,
    topic: string,
    message: string,
    height: number,
  };

  state = {
    optionSelected: 0,
    height: 28,
    topic: '',
    message: '',
  };

  handleTopicChange = (topic: string) => {
    this.setState({ topic });
  };

  handleMessageChange = (message: string) => {
    this.setState({ message });
    const { auth } = this.props;
    registerUserInputActivity(auth);
  };

  handleHeightChange = (height: number) => {
    this.setState({ height });
  };

  clearMessageInput = () => {
    if (this.topicInput) {
      this.topicInput.clear();
    }
    if (this.messageInput) {
      this.messageInput.clear();
    }
    this.handleMessageChange('');
  };

  handleSend = () => {
    const { auth, narrow } = this.props;
    const { topic, message } = this.state;

    if (isPrivateOrGroupNarrow(narrow)) {
      sendMessage(auth, 'private', narrow[0].operand, '', message);
    } else if (isTopicNarrow(narrow)) {
      sendMessage(auth, 'stream', narrow[0].operand, narrow[1].operand, message);
    } else if (isStreamNarrow(narrow)) {
      sendMessage(auth, 'stream', narrow[0].operand, topic, message);
    }

    this.clearMessageInput();
  };

  handleAutoComplete = input => this.setState({ message: input });

  handleChangeText = input => this.setState({ message: input });

  componentWillReceiveProps(nextProps) {
    if (nextProps.editMessage !== this.props.editMessage) {
      this.setState({
        message: nextProps.editMessage ? nextProps.editMessage.content : '',
      });
    }
  }

  render() {
    const { styles } = this.context;
    const { height, message } = this.state;
    const { auth, narrow, users } = this.props;

    const canSelectTopic = isStreamNarrow(narrow);
    const messageHeight = Math.min(Math.max(MIN_HEIGHT, height + 10), MAX_HEIGHT);
    const totalHeight = canSelectTopic ? messageHeight + 30 : messageHeight;
    const placeholder = getComposeInputPlaceholder(narrow, auth.email, users);

    return (
      <View style={[styles.composeBox, { height: totalHeight }]}>
        <AutoCompleteView text={message} onAutocomplete={this.handleMessageChange} />
        <View style={componentStyles.bottom}>
          <ComposeMenu />
        </View>
        <View style={[componentStyles.composeText]}>
          {canSelectTopic &&
            <Input
              style={[styles.composeTextInput, componentStyles.topic]}
              underlineColorAndroid="transparent"
              placeholder="Topic"
              textInputRef={component => {
                this.topicInput = component;
              }}
              onChangeText={this.handleTopicChange}
              // value={topic}
            />}
          <MultilineInput
            style={styles.composeTextInput}
            placeholder={placeholder}
            textInputRef={component => {
              this.messageInput = component;
            }}
            onChange={this.handleMessageChange}
            onHeightChange={this.handleHeightChange}
          />
        </View>
        <View style={componentStyles.bottom}>
          <SubmitButton disabled={message.length === 0} onPress={this.handleSend} />
        </View>
      </View>
    );
  }
}

export default connect(
  (state: GlobalState) => ({
    auth: getAuth(state),
    narrow: state.chat.narrow,
    users: state.users,
    lastTopic: getLastTopicInActiveNarrow(state),
    editMessage: state.app.editMessage,
  }),
  boundActions,
)(ComposeBox);
