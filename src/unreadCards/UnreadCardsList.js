/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, Text } from 'react-native';

import StreamCard from './StreamCard';

export default class UnreadCardsList extends PureComponent {

  renderItem = ({item}) => {
    return (
      <StreamCard />
    );
  };

  render() {
    return (
      <FlatList
        style={{
          backgroundColor: '#F3F3F7',
        }}
        data={[{key: 'a'}, {key: 'b'}]}
        renderItem={this.renderItem}
      />
    );
  }
};