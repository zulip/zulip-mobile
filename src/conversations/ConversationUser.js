import React from 'react';

import UserItem from '../users/UserItem';
import { getFullUrl } from '../utils/url';
import { isPrivateNarrow } from '../utils/narrow';

export default ({ email, users, realm, narrow, onNarrow }) => {
  const user = users.find(x => x.email === email);

  if (!user) return null;

  return (
    <UserItem
      key={email}
      fullName={user.fullName}
      avatarUrl={getFullUrl(user.avatarUrl, realm)}
      email={email}
      status={user.status}
      isSelected={isPrivateNarrow(narrow) && narrow[0].operand === email}
      onPress={onNarrow}
    />
  );
};
