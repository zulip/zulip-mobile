/* @flow */
import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Actions, User } from '../types';
import { ZulipButton } from '../common';
import { groupNarrow } from '../utils/narrow';
import UserList from '../users/UserList';
import AvatarList from './AvatarList';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  list: {
    flexShrink: 1,
  },
});

export default class GroupCard extends PureComponent {
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
        <AvatarList users={selected} onPress={this.handleUserDeselect} />
        <UserList
          style={styles.list}
          ownEmail={ownEmail}
          filter=""
          users={users}
          onPress={this.handleUserPress}
        />
        <ZulipButton text="Create" disabled={!selected.length} onPress={this.handleCreateGroup} />
      </View>
    );
  }
}
