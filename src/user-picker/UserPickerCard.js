/* @flow strict-local */
import React, { PureComponent } from 'react';
import { View } from 'react-native';
import type { FlatList } from 'react-native';
import { createSelector } from 'reselect';

import type { User, UserId, UserOrBot, PresenceState, Selector, Dispatch } from '../types';
import { createStyleSheet } from '../styles';
import { connect } from '../react-redux';
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
  dispatch: Dispatch,
  users: User[],
  presences: PresenceState,
  filter: string,
  onComplete: (selected: UserOrBot[]) => void,
|}>;

type State = {|
  selected: UserOrBot[],
|};

class UserPickerCard extends PureComponent<Props, State> {
  state = {
    selected: [],
  };

  listRef: ?FlatList<UserOrBot>;

  handleUserPress = (user: UserOrBot) => {
    this.setState(state => {
      if (state.selected.find(x => x.user_id === user.user_id)) {
        return { selected: state.selected.filter(x => x.user_id !== user.user_id) };
      } else {
        return { selected: [...state.selected, user] };
      }
    });
  };

  handleUserDeselect = (userId: UserId) => {
    this.setState(state => ({
      selected: state.selected.filter(x => x.user_id !== userId),
    }));
  };

  handleComplete = () => {
    const { onComplete } = this.props;
    const { selected } = this.state;
    onComplete(selected);
  };

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    const list = this.listRef;
    if (list && this.state.selected.length > prevState.selected.length) {
      setTimeout(() => list.scrollToEnd());
    }
  };

  render() {
    const { filter, users, presences } = this.props;
    const { selected } = this.state;
    return (
      <View style={styles.wrapper}>
        <AnimatedScaleComponent visible={selected.length > 0}>
          <AvatarList
            listRef={component => {
              this.listRef = component;
            }}
            users={selected}
            onPress={this.handleUserDeselect}
          />
        </AnimatedScaleComponent>
        {selected.length > 0 && <LineSeparator />}
        <UserList
          filter={filter}
          users={users}
          presences={presences}
          selected={selected}
          onPress={this.handleUserPress}
        />
        <AnimatedScaleComponent style={styles.button} visible={selected.length > 0}>
          <FloatingActionButton
            Icon={IconDone}
            size={50}
            disabled={selected.length === 0}
            onPress={this.handleComplete}
          />
        </AnimatedScaleComponent>
      </View>
    );
  }
}

// The users we want to show in this particular UI.
// We exclude (a) users with `is_active` false; (b) cross-realm bots; (c) self.
const getUsersToShow: Selector<User[]> = createSelector(
  getUsers,
  getOwnUserId,
  (users, ownUserId) => users.filter(user => user.user_id !== ownUserId),
);

export default connect(state => ({
  users: getUsersToShow(state),
  presences: getPresence(state),
}))(UserPickerCard);
