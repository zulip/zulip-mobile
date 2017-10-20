/* @flow */
import React, { PureComponent } from 'react';

import connectWithActions from '../connectWithActions';
import type { Narrow, User } from '../types';
import { getUsers } from '../selectors';
import UserItem from '../users/UserItem';
import { isPrivateNarrow } from '../utils/narrow';

type Props = {
  email: string,
  users: User[],
  unreadCount: number,
  realm: string,
  presence?: Object,
  narrow?: Narrow,
  onPress: (email: string) => void,
};

class ConversationUser extends PureComponent<Props> {
  props: Props;

  render() {
    const { email, unreadCount, users, realm, narrow, presence, onPress } = this.props;
    const user = users.find(x => x.email === email);
    const isSelected = narrow && isPrivateNarrow(narrow) && narrow[0].operand === email;

    if (!user) return null;

    return (
      <UserItem
        fullName={user.fullName}
        avatarUrl={user.avatarUrl}
        email={email}
        unreadCount={unreadCount}
        presence={presence}
        isSelected={isSelected}
        realm={realm}
        onPress={onPress}
      />
    );
  }
}

export default connectWithActions(state => ({
  narrow: state.chat.narrow,
  users: getUsers(state),
}))(ConversationUser);
