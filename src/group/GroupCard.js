/* @flow */
import { connect } from 'react-redux';

import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { User, Dispatch, PresenceState } from '../types';
import { FloatingActionButton, LineSeparator } from '../common';
import { IconDone } from '../common/Icons';
import { groupNarrow } from '../utils/narrow';
import UserList from '../users/UserList';
import AvatarList from './AvatarList';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';
import { getOwnEmail, getPresence, getUsersSansMe } from '../selectors';
import { doNarrow, navigateBack } from '../actions';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});

type Props = {
  dispatch: Dispatch,
  ownEmail: string,
  users: User[],
  presences: PresenceState,
  filter: string,
};

type State = {
  selected: User[],
};

class GroupCard extends PureComponent<Props, State> {
  listRef: (component: any) => void;

  props: Props;
  state: State;

  state = {
    selected: [],
  };

  handleUserSelect = (email: string) => {
    const { users } = this.props;
    const { selected } = this.state;

    const user = users.find(x => x.email === email);
    if (user) {
      this.setState({
        selected: [...selected, user],
      });
    }
  };

  handleUserPress = (email: string) => {
    const { selected } = this.state;

    if (selected.find(x => x.email === email)) {
      this.handleUserDeselect(email);
    } else {
      this.handleUserSelect(email);
    }
  };

  handleUserDeselect = (email: string) => {
    const { selected } = this.state;

    this.setState({
      selected: selected.filter(x => x.email !== email),
    });
  };

  handleCreateGroup = () => {
    const { dispatch } = this.props;
    const { selected } = this.state;

    const recipients = selected.map(user => user.email);
    dispatch(navigateBack());
    dispatch(doNarrow(groupNarrow(recipients)));
  };

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    if (this.listRef && this.state.selected.length > prevState.selected.length) {
      setTimeout(() => this.listRef.scrollToEnd());
    }
  };

  render() {
    const { filter, ownEmail, users, presences } = this.props;
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
          style={styles.list}
          ownEmail={ownEmail}
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
            onPress={this.handleCreateGroup}
          />
        </AnimatedScaleComponent>
      </View>
    );
  }
}

export default connect(state => ({
  ownEmail: getOwnEmail(state),
  users: getUsersSansMe(state),
  presences: getPresence(state),
}))(GroupCard);
