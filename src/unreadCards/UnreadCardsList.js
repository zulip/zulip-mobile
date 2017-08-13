/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import StreamCard from './StreamCard';

// Dummy Data
const data = [
  {
    name: 'mobile',
    color: '#8999FF',
    unreadCount: 6,
    topics: [
      {
        name: 'Design',
        unreadCount: 4,
      },
      {
        name: 'zulip/zulip-master',
        unreadCount: 2,
      },
    ],
  },
  {
    name: 'backend',
    color: '#F4A543',
    unreadCount: 27,
    topics: [
      {
        name: 'meeting',
        unreadCount: 27,
      },
    ],
  },
];

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#F3F3F7',
  },
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
        unreadCount={item.unreadCount}
        topics={item.topics}
        stream={item.name}
        color={item.color}
      />
    );
  };

  render() {
    return <FlatList style={styles.list} data={data} renderItem={this.renderItem} />;
  }
}
