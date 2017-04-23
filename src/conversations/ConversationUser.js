import React from 'react';

import UserItem from '../users/UserItem';
import { isPrivateNarrow } from '../utils/narrow';

export default ({ email, unreadCount, users, realm, narrow, onNarrow }) => {
  const user = users.find(x => x.email === email);

  if (!user) return null;

  return (
    <UserItem
      fullName={user.fullName}
      avatarUrl={user.avatarUrl}
      email={email}
      unreadCount={unreadCount}
      status={user.status}
      isSelected={isPrivateNarrow(narrow) && narrow[0].operand === email}
      onPress={onNarrow}
      realm={realm}
    />
  );
};
