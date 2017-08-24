/* @flow */
import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';

import TopicCard from './TopicCard';

export default class TopicList extends PureComponent {
  renderItem = ({ item }) => <TopicCard name={item.name} unreadCount={item.unreadCount} />;

  render() {
    const { topics } = this.props;

    return <FlatList data={topics} renderItem={this.renderItem} />;
  }
}
