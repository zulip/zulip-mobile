/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Stream, TopicExtended } from '../types';
import { connectWithActionsPreserveOnBack } from '../connectWithActions';
import { Screen } from '../common';
import { topicNarrow } from '../utils/narrow';
import { getTopicsInStream } from '../selectors';
import { getStreamEditInitialValues } from '../subscriptions/subscriptionSelectors';
import TopicList from './TopicList';

type Props = {
  actions: Actions,
  stream: Stream,
  topics: TopicExtended[],
};

type State = {
  filter: string,
};

class TopicListScreen extends PureComponent<Props, State> {
  props: Props;

  state: State = {
    filter: '',
  };

  componentDidMount() {
    const { actions, stream } = this.props;
    actions.fetchTopics(stream.stream_id);
  }

  handlePress = (streamObj: string, topic: string) => {
    const { actions, stream } = this.props;
    actions.doNarrow(topicNarrow(stream.name, topic));
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

export default connectWithActionsPreserveOnBack((state, props) => ({
  stream: getStreamEditInitialValues(state),
  topics: getTopicsInStream(props.navigation.state.params.streamId)(state),
}))(TopicListScreen);
