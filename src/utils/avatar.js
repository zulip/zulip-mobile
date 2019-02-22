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

export const getAvatarUrl = (
  avatarUrl: string | null | void,
  email: string,
  realm: string,
  size: number = 80,
): string =>
  typeof avatarUrl === 'string' ? getFullUrl(avatarUrl, realm) : getGravatarFromEmail(email, size);

export const getAvatarFromUser = (user: User, realm: string, size?: number): string =>
  getAvatarUrl(user.avatar_url, user.email, realm, size);

export const getAvatarFromMessage = (
  message: Message | Outbox,
  realm: string,
  size?: number,
): string => getAvatarUrl(message.avatar_url, message.sender_email, realm, size);
