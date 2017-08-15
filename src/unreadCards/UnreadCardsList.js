/* @flow */
import React, { PureComponent } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';

import StreamCard from './StreamCard';
import PrivateMessageCard from './PrivateMessageCard';

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#F3F3F7',
    paddingTop: 7,
  },
  separator: {
    margin: 7,
  },
});

export default class UnreadCardsList extends PureComponent {
  state = {
    data: [
      {
        id: 0,
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
        id: 1,
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
        id: 2,
        name: 'checkins',
        color: '#B95732',
        unreadCount: 2,
        isPrivate: false,
        topics: [
          {
            name: 'Nash',
            unreadCount: 1,
          },
          {
            name: 'Joe',
            unreadCount: 3,
          },
        ],
      },
    ],
  };

  // TODO: Improve this
  removeCard = index => {
    const start = this.state.data.slice(0, index);
    const end = this.state.data.slice(index + 1);

    this.setState({
      data: start.concat(end),
    });
  };

  renderSeparator = () => <View style={styles.separator} />;

  renderItem = ({ item, index }) => {
    console.log('HERE: ', item, index);

    return (
      <StreamCard
        unreadCount={item.unreadCount}
        topics={item.topics}
        stream={item.name}
        color={item.color}
        onSwipe={() => {
          this.removeCard(item.id);
        }}
      />
    );
  };

  render() {
    console.log(this.state.data);

    return (
      <FlatList
        style={styles.list}
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={this.renderSeparator}
      />
    );
  }
}
