/* @flow strict-local */
import template from './template';
import type { UserOrBot } from '../../types';
import { getAvatarFromUser } from '../../utils/avatar';

const typingAvatar = (realm: URL, user: UserOrBot): string => template`
<div class="avatar">
  <img
    class="avatar-img"
    data-sender-id="${user.user_id}"
    src="${getAvatarFromUser(user, realm)}">
</div>
`;

export default (realm: URL, users: $ReadOnlyArray<UserOrBot>): string => template`
  $!${users.map(user => typingAvatar(realm, user)).join('')}
  <div class="content">
    <span></span>
    <span></span>
    <span></span>
  </div>
`;
