/* @flow strict-local */
import React, { useState, useRef, useEffect } from 'react';
import type { Node } from 'react';
import { View, FlatList } from 'react-native';
import { createSelector } from 'reselect';

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

export default function UserPickerCard(props: Props): Node {
  const { filter } = props;

  const users = useSelector(getUsersToShow);
  const presences = useSelector(getPresence);

  const [selectedState, setSelectedState] = useState<UserOrBot[]>([]);
  const listRef = useRef<FlatList<UserOrBot> | null>(null);

  const prevSelectedState = usePrevious(selectedState);
  useEffect(() => {
    if (prevSelectedState && selectedState.length > prevSelectedState.length) {
      setTimeout(() => {
        listRef.current?.scrollToEnd();
      });
    }
  }, [selectedState, prevSelectedState, listRef]);

  return (
    <View style={styles.wrapper}>
      <AnimatedScaleComponent visible={selectedState.length > 0}>
        <AvatarList
          listRef={listRef}
          users={selectedState}
          onPress={(userId: UserId) => {
            setSelectedState(state => state.filter(x => x.user_id !== userId));
          }}
        />
      </AnimatedScaleComponent>
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
      <AnimatedScaleComponent style={styles.button} visible={selectedState.length > 0}>
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
