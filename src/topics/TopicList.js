/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { Actions, Stream, TopicDetails } from '../types';
import connectWithActions from '../connectWithActions';
import { getStreamEditInitialValues } from '../subscriptions/subscriptionSelectors';
import { topicNarrow } from '../utils/narrow';
import { getTopicsInScreen } from '../selectors';
import TopicItem from '../streams/TopicItem';
import { LoadingIndicator, SectionSeparatorBetween, SearchEmptyState } from '../common';

const styles = StyleSheet.create({
  list: {
    flex: 1,
    flexDirection: 'column',
  },
});

type Props = {
  actions: Actions,
  stream: Stream,
  topics: TopicDetails[],
};

class TopicList extends PureComponent<Props> {
  props: Props;

  componentDidMount() {
    const { actions, stream } = this.props;
    actions.fetchTopics(stream.stream_id);
  }

  static defaultProps = {
    showDescriptions: false,
    showSwitch: false,
    selected: false,
    streams: [],
  };

  handlePress = (streamObj: string, topic: string) => {
    const { actions, stream } = this.props;
    actions.doNarrow(topicNarrow(stream.name, topic));
  };

  render() {
    const { topics } = this.props;

    if (!topics) {
      return <LoadingIndicator size={40} />;
    }

    if (topics.length === 0) {
      return <SearchEmptyState text="No topics found" />;
    }

    return (
      <FlatList
        style={styles.list}
        data={topics}
        keyExtractor={item => item.name}
        renderItem={({ item }) => (
          <TopicItem name={item.name} isMuted={false} unreadCount={0} onPress={this.handlePress} />
        )}
        SectionSeparatorComponent={SectionSeparatorBetween}
      />
    );
  }
}

export default connectWithActions(state => ({
  stream: getStreamEditInitialValues(state),
  topics: getTopicsInScreen(state),
}))(TopicList);
