/* @flow strict-local */
import md5 from 'blueimp-md5';

import type { Message, Outbox, User } from '../types';
import { getFullUrl } from './url';

export const getMediumAvatar = (avatarUrl: string): string => {
  const matches = new RegExp(/(\w+)\.png/g).exec(avatarUrl);

  return matches ? avatarUrl.replace(matches[0], `${matches[1]}-medium.png`) : avatarUrl;
};

export const getGravatarFromEmail = (email: string = '', size: number = 80): string =>
  `https://secure.gravatar.com/avatar/${md5(email.toLowerCase())}?d=identicon&s=${size}`;

export const getAvatarFromUser = (user: User, realm: string): string =>
  typeof user.avatar_url === 'string'
    ? getFullUrl(user.avatar_url, realm)
    : getGravatarFromEmail(user.email);

export const getAvatarFromMessage = (message: Message | Outbox, realm: string): string =>
  typeof message.avatar_url === 'string'
    ? getFullUrl(message.avatar_url, realm)
    : getGravatarFromEmail(message.sender_email);
