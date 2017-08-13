/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';

import StreamCard from './StreamCard';

// Dummy Data
const data = [
  {
    name: 'mobile',
    color: '#8999FF'
  },
  {
    name: 'backend',
    color: '#F4A543'
  }
]

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#F3F3F7',
  }
});

export default class UnreadCardsList extends PureComponent {

  /*
    Props needed in stream card
    actions,
    streamName,
    isPrivate,
    topic, (topics)
    color
  */

  renderItem = ({ item }) => {
    return (
      <StreamCard
        stream={item.name}
        color={item.color}
      />
    );
  };

  render() {
    return (
      <FlatList
        style={styles.list}
        data={data}
        renderItem={this.renderItem}
      />
    );
  }
};