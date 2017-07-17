/* @flow */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import boundActions from '../boundActions';
import type { Narrow, User } from '../types';
import UserItem from '../users/UserItem';
import { isPrivateNarrow } from '../utils/narrow';

class ConversationUser extends PureComponent {
  props: {
    email: string,
    users: User[],
    unreadCount: number,
    realm: string,
    narrow?: Narrow,
    onPress: (email: string) => void,
  };

  render() {
    const { email, unreadCount, users, realm, narrow, onPress } = this.props;
    const user = users.find(x => x.email === email);
    const isSelected = narrow && isPrivateNarrow(narrow) && narrow[0].operand === email;

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

export default connect(
  state => ({
    narrow: state.chat.narrow,
    users: state.users,
  }),
  boundActions,
)(ConversationUser);
