/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { User } from '../types';
import AvatarItem from './AvatarItem';

const styles = StyleSheet.create({
  list: {},
});

export default class AvatarList extends PureComponent {
  props: {
    listRef: (component: Object) => void,
    users: User[],
    onPress: (email: string) => void,
  };

  render() {
    const { listRef, users, onPress } = this.props;

    return (
      <FlatList
        style={styles.list}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialNumToRender={20}
        data={users}
        ref={component => {
          if (listRef) listRef(component);
        }}
        keyExtractor={item => item.email}
        renderItem={({ item }) => <AvatarItem {...item} onPress={onPress} />}
      />
    );
  }
}
