/* @flow */
import React, { PureComponent } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';

import type { User } from '../types';
import AvatarItem from './AvatarItem';
import { FloatingActionButton } from '../common';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { IconDone } from '../common/Icons';

const styles = StyleSheet.create({
  list: {},
  wrapper: {
    flexDirection: 'row',
  },
  button: {
    margin: 8,
  },
});

type Props = {
  users: User[],
  listRef: (component: any) => void,
  onPress: (email: string) => void,
  onButtonPress: () => void,
};

export default class AvatarList extends PureComponent<Props> {
  props: Props;

  render() {
    const { listRef, users, onPress, onButtonPress } = this.props;

    return (
      <View style={styles.wrapper}>
        <FlatList
          style={styles.list}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialNumToRender={20}
          data={users}
          ref={(component: any) => {
            if (listRef) {
              listRef(component);
            }
          }}
          keyExtractor={item => item.email}
          renderItem={({ item }) => (
            <AvatarItem
              email={item.email}
              avatarUrl={item.avatar_url}
              fullName={item.full_name}
              onPress={onPress}
            />
          )}
        />
        <AnimatedScaleComponent style={styles.button} visible>
          <FloatingActionButton Icon={IconDone} size={50} onPress={onButtonPress} disabled={false} />
        </AnimatedScaleComponent>
      </View>
    );
  }
}
