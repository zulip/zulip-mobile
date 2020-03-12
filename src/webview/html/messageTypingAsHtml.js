/* @flow strict-local */
import template from './template';
import type { User } from '../../types';
import { getAvatarFromUser } from '../../utils/avatar';

const typingAvatar = (realm: string, user: User): string => template`
<div class="avatar">
  <img
    class="avatar-img"
    data-sender-id="${user.user_id}"
    src="${getAvatarFromUser(user, realm)}">
</div>
`;

export default (realm: string, users: $ReadOnlyArray<User>): string => template`
  $!${users.map(user => typingAvatar(realm, user)).join('')}
  <div class="content">
    <span></span>
    <span></span>
    <span></span>
  </div>
`;
