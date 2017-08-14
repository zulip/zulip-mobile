/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import StreamCard from './StreamCard';
import PrivateMessageCard from './PrivateMessageCard';

// Dummy Data
const data = [
  {
    name: 'mobile',
    color: '#8999FF',
    unreadCount: 6,
    isPrivate: false,
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
    isPrivate: false,
    topics: [
      {
        name: 'meeting',
        unreadCount: 27,
      },
    ],
  },
  {
    sender: 'Neeraj Wahi',
    unreadCount: 3,
    isPrivate: true
  },
  {
    name: 'checkins',
    color: '#B95732',
    unreadCount: 2,
    isPrivate: false,
    topics: [
      {
        name: 'Nash',
        unreadCount: 1
      },
      {
        name: 'Joe',
        unreadCount: 3
      }
    ]
  },

];

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#F3F3F7',
  },
});

export default class UnreadCardsList extends PureComponent {
   renderItem = ({ item }) => {
    if (item.isPrivate) {
      return (
        <PrivateMessageCard
          sender={item.sender}
          unreadCount={item.unreadCount}
        />
      )
    }
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
