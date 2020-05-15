/* @flow strict-local */

import React, { PureComponent } from 'react';

import type { NavigationScreenProp } from 'react-navigation';
import type { Dispatch, Stream, TopicExtended } from '../types';
import { connect } from '../react-redux';
import { Screen } from '../common';
import { topicNarrow } from '../utils/narrow';
import { getTopicsForStream } from '../selectors';
import { getStreamForId } from '../subscriptions/subscriptionSelectors';
import TopicList from './TopicList';
import { fetchTopics, doNarrow } from '../actions';

type SelectorProps = $ReadOnly<{|
  stream: Stream,
  topics: ?(TopicExtended[]),
|}>;

type Props = $ReadOnly<{|
  navigation: NavigationScreenProp<{ params: {| streamId: number |} }>,

  dispatch: Dispatch,
  ...SelectorProps,
|}>;

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
      topics
      && topics
        .filter(topic => topic.name.toLowerCase().includes(filter.toLowerCase()))
        .sort(
          (x, y) =>
            x.name.toLowerCase().indexOf(filter.toLowerCase())
            - y.name.toLowerCase().indexOf(filter.toLowerCase()),
        );

    return (
      <Screen title="Topics" centerContent search searchBarOnChange={this.handleFilterChange}>
        <TopicList topics={filteredTopics} onPress={this.handlePress} />
      </Screen>
    );
  }
}

export default connect<SelectorProps, _, _>((state, props) => ({
  stream: getStreamForId(state, props.navigation.state.params.streamId),
  topics: getTopicsForStream(state, props.navigation.state.params.streamId),
}))(TopicListScreen);
