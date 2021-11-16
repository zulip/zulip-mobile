/* @flow strict-local */
import React from 'react';
import type { ComponentType } from 'react';

import type { ValidationError } from './ShareWrapper';
import type { SharingNavigationProp } from './SharingScreen';
import type { RouteProp } from '../react-navigation';
import type { Dispatch, Subscription, Auth, GetText } from '../types';
import type { SharedData } from './types';
import { TranslationContext } from '../boot/TranslationProvider';
import { connect } from '../react-redux';
import { Input } from '../common';
import { getSubscriptionsById } from '../subscriptions/subscriptionSelectors';
import StreamAutocomplete from '../autocomplete/StreamAutocomplete';
import TopicAutocomplete from '../autocomplete/TopicAutocomplete';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { streamNarrow } from '../utils/narrow';
import { getAuth, getRealm } from '../selectors';
import { fetchTopicsForStream } from '../topics/topicActions';
import ShareWrapper from './ShareWrapper';

type OuterProps = $ReadOnly<{|
  // These should be passed from React Navigation
  navigation: SharingNavigationProp<'share-to-stream'>,
  route: RouteProp<'share-to-stream', {| sharedData: SharedData |}>,
|}>;

type SelectorProps = $ReadOnly<{|
  subscriptions: Map<number, Subscription>,
  auth: Auth,
  mandatoryTopics: boolean,
|}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  ...SelectorProps,
  dispatch: Dispatch,
|}>;

type State = $ReadOnly<{|
  stream: string,
  topic: string,
  isStreamFocused: boolean,
  isTopicFocused: boolean,
|}>;

class ShareToStreamInner extends React.Component<Props, State> {
  static contextType = TranslationContext;
  context: GetText;

  state = {
    stream: '',
    topic: '',
    isStreamFocused: false,
    isTopicFocused: false,
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

  handleStreamChange = stream => {
    this.setState({ stream });
  };

  handleTopicChange = topic => {
    this.setState({ topic });
  };

  handleStreamAutoComplete = (rawStream: string) => {
    // TODO: What is this for? (write down our assumptions)
    const stream = rawStream.split('**')[1];
    this.setState({ stream, isStreamFocused: false });
  };

  handleTopicAutoComplete = (topic: string) => {
    this.setState({ topic });
  };

  getValidationErrors: string => $ReadOnlyArray<ValidationError> = message => {
    const { mandatoryTopics } = this.props;
    const { stream, topic } = this.state;
    const { sharedData } = this.props.route.params;

    const result = [];

    if (stream.trim() === '') {
      result.push('stream-empty');
    }

    if (topic.trim() === '' && mandatoryTopics) {
      result.push('mandatory-topic-empty');
    }

    if (sharedData.type === 'text' && message === '') {
      result.push('message-empty');
    }

    return result;
  };

  render() {
    const { sharedData } = this.props.route.params;
    const { stream, topic, isStreamFocused, isTopicFocused } = this.state;
    const narrow = streamNarrow(stream);
    const sendTo = { stream, topic, type: 'stream' };

    return (
      <ShareWrapper
        sharedData={sharedData}
        getValidationErrors={this.getValidationErrors}
        sendTo={sendTo}
      >
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
      </ShareWrapper>
    );
  }
}

const ShareToStream: ComponentType<OuterProps> = connect(state => ({
  subscriptions: getSubscriptionsById(state),
  auth: getAuth(state),
  mandatoryTopics: getRealm(state).mandatoryTopics,
}))(ShareToStreamInner);

export default ShareToStream;
