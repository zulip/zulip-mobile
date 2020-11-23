/* @flow strict-local */
import md5 from 'blueimp-md5';

import type { Message, Outbox, UserOrBot } from '../types';

/**
 * When selecting the size of a gravatar we can pick any arbitrary
 * size we want. For server-uploaded avatars this is not the case.
 * We have only:
 *  * default - image is 100x100
 *  * medium - image is 500x500
 *
 * This function converts a normal avatar to medium-sized one.
 */
export const getMediumAvatar = (avatarUrl: string): string => {
  const matches = new RegExp(/(\w+)\.png/g).exec(avatarUrl);

  return matches ? avatarUrl.replace(matches[0], `${matches[1]}-medium.png`) : avatarUrl;
};

export const getGravatarFromEmail = (email: string = '', size: number): string =>
  `https://secure.gravatar.com/avatar/${md5(email.toLowerCase())}?d=identicon&s=${size}`;

export const getAvatarUrl = (
  avatarUrl: ?string,
  email: string,
  realm: URL,
  size: number,
): string => {
  if (typeof avatarUrl !== 'string') {
    return getGravatarFromEmail(email, size);
  }

  const fullUrl = new URL(avatarUrl, realm).toString();

  return size > 100 ? getMediumAvatar(fullUrl) : fullUrl;
};

export const getAvatarFromUser = (user: UserOrBot, realm: URL, size: number): string =>
  getAvatarUrl(user.avatar_url, user.email, realm, size);

export const getAvatarFromMessage = (message: Message | Outbox, realm: URL, size: number): string =>
  getAvatarUrl(message.avatar_url, message.sender_email, realm, size);
