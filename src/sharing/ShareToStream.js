/* @flow strict-local */
import React from 'react';
import { View, Image, ScrollView, BackHandler } from 'react-native';

import type { SharingNavigationProp, SharingRouteProp } from './SharingScreen';
import * as NavigationService from '../nav/NavigationService';
import type { Dispatch, Subscription, Auth, GetText } from '../types';
import { createStyleSheet } from '../styles';
import { TranslationContext } from '../boot/TranslationProvider';
import { connect } from '../react-redux';
import { ZulipButton, Input } from '../common';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import StreamAutocomplete from '../autocomplete/StreamAutocomplete';
import TopicAutocomplete from '../autocomplete/TopicAutocomplete';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { streamNarrow } from '../utils/narrow';
import { getAuth } from '../selectors';
import { navigateBack } from '../nav/navActions';
import { fetchTopicsForStream } from '../topics/topicActions';
import { handleSend } from './send';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
    padding: 10,
  },
  imagePreview: {
    margin: 10,
    borderRadius: 5,
    width: 200,
    height: 200,
  },
  container: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    margin: 8,
  },
});

type Props = $ReadOnly<{|
  navigation: SharingNavigationProp<'share-to-stream'>,
  route: SharingRouteProp<'share-to-stream'>,

  dispatch: Dispatch,
  subscriptions: Map<number, Subscription>,
  auth: Auth,
|}>;

type State = $ReadOnly<{|
  stream: string,
  topic: string,
  message: string,
  isStreamFocused: boolean,
  isTopicFocused: boolean,
  sending: boolean,
|}>;

class ShareToStream extends React.Component<Props, State> {
  static contextType = TranslationContext;
  context: GetText;

  state = {
    stream: '',
    topic: '',
    message: this.props.route.params.sharedData.sharedText || '',
    isStreamFocused: false,
    isTopicFocused: false,
    sending: false,
  };

  setSending = () => {
    this.setState({ sending: true });
  };

  blurStream = () => {
    this.setState({ isStreamFocused: false });
  };

  focusStream = () => {
    this.setState({ isStreamFocused: true });
  };

  blurTopic = () => {
    this.setState({ isTopicFocused: false });
  };

  focusTopic = () => {
    const { stream } = this.state;
    const { dispatch } = this.props;
    const narrow = streamNarrow(stream);

    dispatch(fetchTopicsForStream(narrow));
    this.setState({ isTopicFocused: true });
  };

  handleMessageChange = message => {
    this.setState({ message });
  };

  handleStreamChange = stream => {
    this.setState({ stream });
  };

  handleTopicChange = topic => {
    this.setState({ topic });
  };

  handleStreamAutoComplete = (rawStream: string) => {
    const stream = rawStream.split('**')[1];
    this.setState({ stream, isStreamFocused: false });
  };

  handleTopicAutoComplete = (topic: string) => {
    this.setState({ topic });
  };

  handleSend = async () => {
    const _ = this.context;
    const { auth } = this.props;
    const { topic, stream, message } = this.state;
    const { sharedData } = this.props.route.params;
    const data = { stream, topic, message, sharedData, type: 'stream' };

    this.setSending();
    await handleSend(data, auth, _);
    this.finishShare();
  };

  finishShare = () => {
    NavigationService.dispatch(navigateBack());
    BackHandler.exitApp();
  };

  isSendButtonEnabled = () => {
    const { stream, topic, message } = this.state;
    const { sharedData } = this.props.route.params;

    if (sharedData.type !== 'text') {
      return stream !== '' && topic !== '';
    }

    return stream !== '' && topic !== '' && message !== '';
  };

  render() {
    const { sharedData } = this.props.route.params;
    const { stream, topic, message, isStreamFocused, isTopicFocused, sending } = this.state;
    const narrow = streamNarrow(stream);

    return (
      <>
        <ScrollView style={styles.wrapper} keyboardShouldPersistTaps="always">
          <View style={styles.container}>
            {sharedData.type === 'image' && (
              <Image source={{ uri: sharedData.sharedImageUrl }} style={styles.imagePreview} />
            )}
            <AnimatedScaleComponent visible={isStreamFocused}>
              <StreamAutocomplete filter={stream} onAutocomplete={this.handleStreamAutoComplete} />
            </AnimatedScaleComponent>
            <Input
              placeholder="Stream"
              value={stream}
              onChangeText={this.handleStreamChange}
              onFocus={this.focusStream}
              onChange={this.focusStream}
              onBlur={this.blurStream}
              selectTextOnFocus
            />
            <View />
            <AnimatedScaleComponent visible={isTopicFocused}>
              <TopicAutocomplete
                text={topic}
                onAutocomplete={this.handleTopicAutoComplete}
                isFocused={isTopicFocused}
                narrow={narrow}
              />
            </AnimatedScaleComponent>
            <Input
              placeholder="Topic"
              value={topic}
              onFocus={this.focusTopic}
              onBlur={this.blurTopic}
              onChangeText={this.handleTopicChange}
              editable={stream !== ''}
            />
            <Input
              placeholder="Message"
              value={message}
              onChangeText={this.handleMessageChange}
              multiline
            />
          </View>
        </ScrollView>
        <View style={styles.actions}>
          <ZulipButton onPress={this.finishShare} style={styles.button} secondary text="Cancel" />
          <ZulipButton
            style={styles.button}
            onPress={this.handleSend}
            text="Send"
            progress={sending}
            disabled={!this.isSendButtonEnabled()}
          />
        </View>
      </>
    );
  }
}

export default connect(state => ({
  subscriptions: getSubscriptionsById(state),
  auth: getAuth(state),
}))(ShareToStream);
