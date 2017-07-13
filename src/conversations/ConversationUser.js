/* @flow */
import React, { PureComponent } from 'react';

import type { Narrow } from '../types';
import UserItem from '../users/UserItem';
import { isPrivateNarrow } from '../utils/narrow';

type Props = {
  email: string,
  users: Object[],
  unreadCount: number,
  realm: string,
  narrow?: Narrow,
  onNarrow: (arg: string) => void,
};

export default class ConversationUser extends PureComponent {
  props: Props;

  render() {
    const { email, unreadCount, users, realm, narrow, onNarrow } = this.props;
    const user = users.find(x => x.email === email);

    if (!user) return null;

    return (
      <UserItem
        fullName={user.fullName}
        avatarUrl={user.avatarUrl}
        email={email}
        unreadCount={unreadCount}
        status={user.status}
        isSelected={narrow && isPrivateNarrow(narrow) && narrow[0].operand === email}
        onPress={onNarrow}
        realm={realm}
      />
    );
  }
}
