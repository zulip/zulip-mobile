/* @flow strict-local */
import React from 'react';
import type { ComponentType } from 'react';

import type { ValidationError } from './ShareWrapper';
import type { SharingNavigationProp } from './SharingScreen';
import type { RouteProp } from '../react-navigation';
import type { Dispatch, Auth, GetText, Stream } from '../types';
import type { SharedData } from './types';
import { TranslationContext } from '../boot/TranslationProvider';
import { connect } from '../react-redux';
import Input from '../common/Input';
import StreamAutocomplete from '../autocomplete/StreamAutocomplete';
import TopicAutocomplete from '../autocomplete/TopicAutocomplete';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { streamNarrow } from '../utils/narrow';
import { getAuth, getRealm, getStreamsByName } from '../selectors';
import { fetchTopicsForStream } from '../topics/topicActions';
import ShareWrapper from './ShareWrapper';

type OuterProps = $ReadOnly<{|
  // These should be passed from React Navigation
  navigation: SharingNavigationProp<'share-to-stream'>,
  route: RouteProp<'share-to-stream', {| sharedData: SharedData |}>,
|}>;

type SelectorProps = $ReadOnly<{|
  streamsByName: Map<string, Stream>,
  auth: Auth,
  mandatoryTopics: boolean,
|}>;

type Props = $ReadOnly<{|
  ...OuterProps,

  ...SelectorProps,
  dispatch: Dispatch,
|}>;

type State = $ReadOnly<{|
  /** The text the user has typed into the "stream name" field. */
  streamName: string,

  /** An actual stream ID corresponding to streamName, or null if none does. */
  streamId: number | null,

  topic: string,
  isStreamFocused: boolean,
  isTopicFocused: boolean,
|}>;

class ShareToStreamInner extends React.Component<Props, State> {
  static contextType = TranslationContext;
  context: GetText;

  state = {
    streamName: '',
    streamId: null,
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
    const { streamId } = this.state;
    const { dispatch } = this.props;

    if (streamId !== null) {
      // We have an actual stream selected.  Fetch its recent topic names.
      // TODO: why do we do this?  `TopicAutocomplete` does the same thing,
      //   with an effect that reruns when the stream changes.
      const narrow = streamNarrow(streamId);
      dispatch(fetchTopicsForStream(narrow));
    }
    // If what's entered in the stream-name field isn't an actual stream,
    // then there's no point fetching topics.
    // … Maybe we shouldn't be allowing this interaction in that case in
    // the first place?

    this.setState({ isTopicFocused: true });
  };

  handleStreamChange = streamName => {
    const stream = this.props.streamsByName.get(streamName);
    this.setState({ streamName, streamId: stream ? stream.stream_id : null });
  };

  handleTopicChange = topic => {
    this.setState({ topic });
  };

  handleStreamAutoComplete = (rawStream: string) => {
    // TODO: What is this for? (write down our assumptions)
    const streamName = rawStream.split('**')[1];
    const stream = this.props.streamsByName.get(streamName);
    this.setState({
      streamName,
      // TODO the "else" case ought to be impossible: the user chose a
      //   stream in autocomplete, and we couldn't find it by name.
      streamId: stream ? stream.stream_id : null,
      isStreamFocused: false,
    });
  };

  handleTopicAutoComplete = (topic: string) => {
    this.setState({ topic });
  };

  getValidationErrors: string => $ReadOnlyArray<ValidationError> = message => {
    const { mandatoryTopics } = this.props;
    const { streamName, streamId, topic } = this.state;
    const { sharedData } = this.props.route.params;

    const result = [];

    if (streamId === null) {
      result.push('stream-invalid');
    }

    if (streamName.trim() === '') {
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
    const { streamName, streamId, topic, isStreamFocused, isTopicFocused } = this.state;
    const narrow = streamId !== null ? streamNarrow(streamId) : null;
    const sendTo = {
      streamName,
      /* $FlowFixMe[incompatible-cast]: ShareWrapper will only look at this
       *   if getValidationErrors returns empty, so only if streamId is
       *   indeed not null.  Should make that logic less indirected and more
       *   transparent. */
      streamId: (streamId: number),
      topic,
      type: 'stream',
    };

    return (
      <ShareWrapper
        sharedData={sharedData}
        getValidationErrors={this.getValidationErrors}
        sendTo={sendTo}
      >
        <AnimatedScaleComponent visible={isStreamFocused}>
          <StreamAutocomplete filter={streamName} onAutocomplete={this.handleStreamAutoComplete} />
        </AnimatedScaleComponent>
        <Input
          placeholder="Stream"
          value={streamName}
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
          editable={streamName !== ''}
          autoCapitalize="none"
        />
      </ShareWrapper>
    );
  }
}

const ShareToStream: ComponentType<OuterProps> = connect(state => ({
  streamsByName: getStreamsByName(state),
  auth: getAuth(state),
  mandatoryTopics: getRealm(state).mandatoryTopics,
}))(ShareToStreamInner);

export default ShareToStream;
