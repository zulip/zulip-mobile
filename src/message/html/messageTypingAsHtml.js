/* @flow */
import type { User } from '../../types';
import { getFullUrl } from '../../utils/url';
import { getGravatarFromEmail } from '../../utils/avatar';

export default (realm: string, users: User) => `
  ${users.map(
    user => `
      <div class="avatar">
        <img
          class="avatar-img"
          data-email="${user.email}"
          src="${
            user.avatarUrl ? getFullUrl(user.avatarUrl, realm) : getGravatarFromEmail(user.email)
          }">
      </div>
  `,
  )}
  <div class="content">${users.length > 1 ? 'are' : 'is'} typing</div>
`;
