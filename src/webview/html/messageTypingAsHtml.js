/* @flow */
import escape from 'lodash.escape';
import type { User } from '../../types';
import { getFullUrl } from '../../utils/url';
import { getGravatarFromEmail } from '../../utils/avatar';

const typingAvatar = (realm: string, user: User): string => `
<div class="avatar">
  <img
    class="avatar-img"
    data-email="${escape(user.email)}"
    src="${escape(
      user.avatarUrl ? getFullUrl(user.avatarUrl, realm) : getGravatarFromEmail(user.email),
    )}">
</div>
`;

export default (realm: string, users: User[]): string => `
  ${users.map(user => typingAvatar(realm, user)).join('')}
  <div class="content">
    <span></span>
    <span></span>
    <span></span>
  </div>
`;
