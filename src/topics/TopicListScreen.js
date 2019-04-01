/* @flow strict-local */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';

import type { Dispatch, GlobalState, Stream, TopicExtended } from '../types';
import { Screen } from '../common';
import { topicNarrow } from '../utils/narrow';
import { getTopicsForStream } from '../selectors';
import { getStreamFromId } from '../subscriptions/subscriptionSelectors';
import TopicList from './TopicList';
import { fetchTopics, doNarrow } from '../actions';

type OwnProps = {|
  navigation: Object,
|};

type StateProps = {|
  dispatch: Dispatch,
  stream: Stream,
  topics: TopicExtended[],
|};

export type Props = {|
  ...OwnProps,
  ...StateProps,
|};

type State = {|
  filter: string,
|};

class TopicListScreen extends PureComponent<Props, State> {
  state = {
    filter: '',
  };

  componentDidMount() {
    const { dispatch, stream } = this.props;
    dispatch(fetchTopics(stream.stream_id));
  }

  handlePress = (streamObj: string, topic: string) => {
    const { dispatch, stream } = this.props;
    dispatch(doNarrow(topicNarrow(stream.name, topic)));
  };

  handleFilterChange = (filter: string) => this.setState({ filter });

  render() {
    const { topics } = this.props;
    const { filter } = this.state;
    const filteredTopics =
      topics && topics.filter(topic => topic.name.toLowerCase().includes(filter.toLowerCase()));

    return (
      <Screen title="Topics" centerContent search searchBarOnChange={this.handleFilterChange}>
        <TopicList topics={filteredTopics} onPress={this.handlePress} />
      </Screen>
    );
  }
}

export default connect((state: GlobalState, props: OwnProps) => ({
  stream: getStreamFromId(state, props.navigation.state.params.streamId),
  topics: getTopicsForStream(state, props.navigation.state.params.streamId),
}))(TopicListScreen);
