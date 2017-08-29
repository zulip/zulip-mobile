/* @flow */
import React, { PureComponent } from 'react';

import type { User } from '../types';
import UserItem from '../users/UserItem';

export default class ConversationUser extends PureComponent {
  props: {
    isSelected: boolean,
    email: string,
    users: User[],
    unreadCount: number,
    realm: string,
    onPress: (email: string) => void,
  };

  render() {
    const { isSelected, email, unreadCount, users, realm, onPress } = this.props;
    const user = users.find(x => x.email === email);

    if (!user) return null;

    return (
      <UserItem
        fullName={user.fullName}
        avatarUrl={user.avatarUrl}
        email={email}
        unreadCount={unreadCount}
        status={user.status}
        isSelected={isSelected}
        realm={realm}
        onPress={onPress}
      />
    );
  }
}
