/* @flow */
import React, { PureComponent } from 'react';

import type { Actions, Stream, Topic } from '../types';
import connectWithActions from '../connectWithActions';
import { Screen } from '../common';
import { topicNarrow } from '../utils/narrow';
import { getTopicsInScreen } from '../selectors';
import { getStreamEditInitialValues } from '../subscriptions/subscriptionSelectors';
import TopicList from './TopicList';

type Props = {
  actions: Actions,
  stream: Stream,
  topics: Topic[],
};

class TopicListScreen extends PureComponent<Props> {
  props: Props;

  componentDidMount() {
    const { actions, stream } = this.props;
    actions.fetchTopics(stream.stream_id);
  }

  handlePress = (streamObj: string, topic: string) => {
    const { actions, stream } = this.props;
    actions.doNarrow(topicNarrow(stream.name, topic));
  };

  render() {
    const { topics } = this.props;

    return (
      <Screen title="Topics" padding>
        <TopicList topics={topics} onPress={this.handlePress} />
      </Screen>
    );
  }
}

export default connectWithActions(state => ({
  stream: getStreamEditInitialValues(state),
  topics: getTopicsInScreen(state),
}))(TopicListScreen);
