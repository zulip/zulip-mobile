/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { Dispatch, GlobalState, Stream, TopicExtended, ApiResponseStreamId  } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { topicNarrow } from '../utils/narrow';
import type { NavigationScreenProp } from 'react-navigation';
import { getTopicsForStream } from '../selectors';
import { getStreamForId } from '../subscriptions/subscriptionSelectors';
import TopicList from './TopicList';
import { fetchTopics, doNarrow } from '../actions';

type Props = {|
  dispatch: Dispatch,
  stream: Stream,
  topics: ?TopicExtended[],
  navigation: NavigationScreenProp<{ params: {| streamId: ApiResponseStreamId |} }>,
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

export default connect((state: GlobalState, props) => ({
  stream: getStreamForId(state, props.navigation.state.params.streamId.stream_id),
  topics: getTopicsForStream(state, props.navigation.state.params.streamId.stream_id),
}))(TopicListScreen);