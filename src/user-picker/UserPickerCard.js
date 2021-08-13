/* @flow strict-local */
import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { createSelector } from 'reselect';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePrevious } from '../reactUtils';
import type { User, UserId, UserOrBot, Selector } from '../types';
import { createStyleSheet } from '../styles';
import { useSelector } from '../react-redux';
import { FloatingActionButton, LineSeparator } from '../common';
import { IconDone } from '../common/Icons';
import UserList from '../users/UserList';
import AvatarList from './AvatarList';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { getUsers, getPresence } from '../selectors';
import { getOwnUserId } from '../users/userSelectors';

const styles = createStyleSheet({
  wrapper: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});

type Props = $ReadOnly<{|
  filter: string,
  onComplete: (selected: UserOrBot[]) => void,
|}>;

// The users we want to show in this particular UI.
// We exclude (a) users with `is_active` false; (b) cross-realm bots; (c) self.
const getUsersToShow: Selector<User[]> = createSelector(
  getUsers,
  getOwnUserId,
  (users, ownUserId) => users.filter(user => user.user_id !== ownUserId),
);

/**
 * A multi-select for users.
 *
 * Needs to occupy the horizontal insets because its descendents (the
 * user items and section headers) do.
 */
export default function UserPickerCard(props: Props) {
  const { filter } = props;

  const users = useSelector(getUsersToShow);
  const presences = useSelector(getPresence);

  const [selectedState, setSelectedState] = useState<UserOrBot[]>([]);
  const listRef = useRef<FlatList<UserOrBot> | null>(null);

  const prevSelectedState = usePrevious(selectedState);
  useEffect(() => {
    if (selectedState.length > prevSelectedState.length) {
      setTimeout(() => {
        listRef.current?.scrollToEnd();
      });
    }
  }, [selectedState, prevSelectedState, listRef]);

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      <SafeAreaView mode="margin" edges={['right', 'left']}>
        <AnimatedScaleComponent visible={selectedState.length > 0}>
          <AvatarList
            listRef={listRef}
            users={selectedState}
            onPress={(userId: UserId) => {
              setSelectedState(state => state.filter(x => x.user_id !== userId));
            }}
          />
        </AnimatedScaleComponent>
      </SafeAreaView>
      {selectedState.length > 0 && <LineSeparator />}
      <UserList
        filter={filter}
        users={users}
        presences={presences}
        selected={selectedState}
        onPress={(user: UserOrBot) => {
          setSelectedState(state => {
            if (state.find(x => x.user_id === user.user_id)) {
              return state.filter(x => x.user_id !== user.user_id);
            } else {
              return [...state, user];
            }
          });
        }}
      />
      <AnimatedScaleComponent
        style={{ ...styles.button, right: styles.button.right + insets.right }}
        visible={selectedState.length > 0}
      >
        <FloatingActionButton
          Icon={IconDone}
          size={50}
          disabled={selectedState.length === 0}
          onPress={() => {
            const { onComplete } = props;
            onComplete(selectedState);
          }}
        />
      </AnimatedScaleComponent>
    </View>
  );
}
