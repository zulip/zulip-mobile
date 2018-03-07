/* @flow */
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { User } from '../types';
import AvatarItem from './AvatarItem';

const styles = StyleSheet.create({
  list: {},
});

type Props = {
  users: User[],
  listRef: (component: any) => void,
  onPress: (email: string) => void,
};

export default class AvatarList extends PureComponent<Props> {
  props: Props;

  render() {
    const { listRef, users, onPress } = this.props;

    return (
      <FlatList
        style={styles.list}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialNumToRender={20}
        data={users}
        ref={(component: any) => {
          if (listRef) listRef(component);
        }}
        keyExtractor={item => item.email}
        renderItem={({ item }) => <AvatarItem {...item} onPress={onPress} />}
      />
    );
  }
}
