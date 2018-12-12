/* @flow strict-local */
import template from './template';
import type { User } from '../../types';
import { getFullUrl } from '../../utils/url';
import { getGravatarFromEmail } from '../../utils/avatar';

const typingAvatar = (realm: string, user: User): string => template`
<div class="avatar">
  <img
    class="avatar-img"
    data-email="${user.email}"
    src="${
      typeof user.avatar_url === 'string'
        ? getFullUrl(user.avatar_url, realm)
        : getGravatarFromEmail(user.email)
    }">
</div>
`;

export default (realm: string, users: User[]): string => template`
  $!${users.map(user => typingAvatar(realm, user)).join('')}
  <div class="content">
    <span></span>
    <span></span>
    <span></span>
  </div>
`;
