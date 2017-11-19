/* @flow */
import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { BRAND_COLOR } from '../styles';
import fetchTopicOfStream from '../api/fetchTopicOfStream';
import { LoadingIndicator, Touchable, RawLabel } from '../common';
import { topicNarrow } from '../utils/narrow';

type Props = {
  streamId: number,
  auth: Auth,
  doNarrowCloseDrawer: () => void,
  name: string,
};

type State = {
  topics: [],
};
const styles = StyleSheet.create({
  indicatorStyles: {
    backgroundColor: BRAND_COLOR,
  },
  textStyle: {
    fontSize: 14,
    padding: 8,
    marginLeft: 25,
  },
});

export default class StreamItem extends Component<Props> {
  props: Props;
  state: State;

  state = {
    topics: null,
  };

  componentDidMount() {
    this.fetchTopic();
  }

  fetchTopic = async () => {
    const { auth, streamId } = this.props;

    const fetchedTopics = await fetchTopicOfStream(auth, streamId);
    this.setState({
      topics: fetchedTopics,
    });
  };

  render() {
    const { topics } = this.state;
    const { doNarrowCloseDrawer, name } = this.props;
    if (topics === null) {
      return <LoadingIndicator size={36} active backgroundColor={styles.indicatorStyles} />;
    } else if (topics.length === 0) {
      return <Text style={styles.textStyle}>No topics found</Text>;
    }
    return (
      <View>
        {topics.map(item => (
          <Touchable
            onPress={() => doNarrowCloseDrawer(topicNarrow(name, item.name))}
            key={item.name}
          >
            <RawLabel style={styles.textStyle} text={item.name} />
          </Touchable>
        ))}
      </View>
    );
  }
}
