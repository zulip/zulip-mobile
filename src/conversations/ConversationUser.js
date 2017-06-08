/* @flow */
import React from 'react';

import { Narrow } from '../types';
import UserItem from '../users/UserItem';
import { isPrivateNarrow } from '../utils/narrow';

type PropTypes = {
  email: string,
  users: Object[],
  unreadCount: number,
  onNarrow: (arg: string) => void,
  realm: string,
  narrow?: Narrow,
  shareScreen: bool,
}


export default ({ email, unreadCount, users, realm, narrow, onNarrow, shareScreen }: PropTypes) => {
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
      shareScreen={shareScreen}
    />
  );
};
