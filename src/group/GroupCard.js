/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions, User } from '../types';
import { FloatingActionButton } from '../common';
import { IconDone } from '../common/Icons';
import { groupNarrow } from '../utils/narrow';
import UserList from '../users/UserList';
import AvatarList from './AvatarList';
import AnimatedHeightComponent from '../animation/AnimatedHeightComponent';
import AnimatedScaleComponent from '../animation/AnimatedScaleComponent';

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

export default class GroupCard extends PureComponent {
  listRef: Object;

  props: {
    actions: Actions,
    ownEmail: string,
    users: User[],
  };

  state = {
    selected: [],
  };

  handleUserSelect = (email: string) => {
    const { users } = this.props;
    const { selected } = this.state;

    const user = users.find(x => x.email === email);

    this.setState({
      selected: [...selected, user],
    });
    this.listRef.scrollToEnd();
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
    const { actions } = this.props;
    const { selected } = this.state;

    const recipients = selected.map(user => user.email);

    actions.doNarrow(groupNarrow(recipients));
    actions.navigateBack();
  };

  render() {
    const { ownEmail, users } = this.props;
    const { selected } = this.state;

    return (
      <View style={styles.wrapper}>
        <AnimatedHeightComponent visible={selected.length > 0} height={70}>
          <AvatarList
            listRef={component => {
              this.listRef = component;
            }}
            users={selected}
            onPress={this.handleUserDeselect}
          />
        </AnimatedHeightComponent>
        <UserList
          style={styles.list}
          ownEmail={ownEmail}
          filter=""
          users={users}
          selected={selected}
          onPress={this.handleUserPress}
        />
        <AnimatedScaleComponent visible={selected.length > 0}>
          <FloatingActionButton
            style={styles.button}
            Icon={IconDone}
            disabled={selected.length === 0}
            onPress={this.handleCreateGroup}
          />
        </AnimatedScaleComponent>
      </View>
    );
  }
}
