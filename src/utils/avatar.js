/* @flow strict-local */
import md5 from 'blueimp-md5';

import type { Message, Outbox, UserOrBot } from '../types';
import { tryParseUrl } from './url';
import * as logging from './logging';

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

export const getGravatarFromEmail = (email: string = '', sizePhysicalPx: number): string =>
  `https://secure.gravatar.com/avatar/${md5(email.toLowerCase())}?d=identicon&s=${sizePhysicalPx}`;

export const getAvatarUrl = (
  avatarUrl: ?string,
  email: string,
  realm: URL,
  sizePhysicalPx: number,
): string => {
  if (typeof avatarUrl !== 'string') {
    // It's our job to compute the Gravatar hash.
    return getGravatarFromEmail(email, sizePhysicalPx);
  }

  // If we don't announce `client_gravatar` to the server (we
  // sometimes don't), or if the server doesn't have
  // `EMAIL_ADDRESS_VISIBILITY_EVERYONE` set, `avatarUrl` will be a
  // Gravatar URL, and we should size it correctly with the `size`
  // parameter.
  const GRAVATAR_ORIGIN = 'https://secure.gravatar.com';
  if (tryParseUrl(avatarUrl)?.origin === GRAVATAR_ORIGIN) {
    const hashMatch = /[0-9a-fA-F]{32}$/.exec(new URL(avatarUrl).pathname);
    if (hashMatch === null) {
      const msg = 'Unexpected Gravatar URL shape from server.';
      logging.error(msg, { value: avatarUrl });
      throw new Error(msg);
    }

    const url = new URL(`/avatar/${hashMatch[0]}`, GRAVATAR_ORIGIN);
    url.searchParams.set('d', 'identicon');
    url.searchParams.set('s', sizePhysicalPx.toString());
    return url.toString();
  }

  const fullUrl = new URL(avatarUrl, realm).toString();

  return sizePhysicalPx > 100 ? getMediumAvatar(fullUrl) : fullUrl;
};

export const getAvatarFromUser = (user: UserOrBot, realm: URL, sizePhysicalPx: number): string =>
  getAvatarUrl(user.avatar_url, user.email, realm, sizePhysicalPx);

export const getAvatarFromMessage = (
  message: Message | Outbox,
  realm: URL,
  sizePhysicalPx: number,
): string => getAvatarUrl(message.avatar_url, message.sender_email, realm, sizePhysicalPx);
