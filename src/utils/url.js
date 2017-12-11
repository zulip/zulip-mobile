/* @flow */
import base64 from 'base-64';

import type { Auth } from '../types';
import { topicNarrow, streamNarrow, groupNarrow, specialNarrow } from './narrow';
import { getUserById } from '../users/userHelpers';
import { transformToEncodedURI } from './string';

export const getPathsFromUrl = (url: string, realm: string) => {
  const paths = url
    .split(realm)
    .pop()
    .split('#narrow/')
    .pop()
    .split('/');

  if (paths.length > 0 && paths[paths.length - 1] === '') {
    // url ends with /
    paths.splice(-1, 1);
  }
  return paths;
};

export const getAuthHeader = (email: string, apiKey: string): ?string =>
  apiKey ? `Basic ${base64.encode(`${email}:${apiKey}`)}` : undefined;

export const encodeAsURI = (params: Object): string =>
  Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

export const getFullUrl = (url: string, realm: string): string =>
  url.startsWith('/') ? `${realm}${url}` : url;

export const isUrlOnRealm = (url: string, realm: string): boolean =>
  url.startsWith('/') || url.startsWith(realm) || !/^(http|www.)/i.test(url);

export const isUrlInAppLink = (url: string, realm: string): boolean =>
  isUrlOnRealm(url, realm) ? /^(\/#narrow|#narrow)/i.test(url.split(realm).pop()) : false;

export const isMessageLink = (url: string, realm: string): boolean =>
  isUrlInAppLink(url, realm) && url.includes('near');

export const isTopicLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isUrlInAppLink(url, realm) &&
    ((paths.length === 4 && paths[0] === 'stream' && paths[2] === 'topic') ||
      (paths.length === 6 &&
        paths[0] === 'stream' &&
        (paths[2] === 'subject' || paths[2] === 'topic') &&
        paths[4] === 'near'))
  );
};

export const isGroupLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isUrlInAppLink(url, realm) &&
    ((paths.length === 2 && paths[0] === 'pm-with') ||
      (paths.length === 4 && paths[0] === 'pm-with' && paths[2] === 'near'))
  );
};

export const isStreamLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return isUrlInAppLink(url, realm) && paths.length === 2 && paths[0] === 'stream';
};

export const isSpecialLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isUrlInAppLink(url, realm) &&
    paths.length === 2 &&
    paths[0] === 'is' &&
    /^(private|starred|mentioned)/i.test(paths[1])
  );
};

export const isEmojiUrl = (url: string, realm: string): boolean =>
  isUrlOnRealm(url, realm) && url.includes('/static/generated/emoji/images/emoji/unicode/');

export const getEmojiUrl = (unicode: string): string =>
  `/static/generated/emoji/images/emoji/unicode/${unicode}.png`;

export const getNarrowFromLink = (url: string, realm: string, users: any[]): [] => {
  const paths = getPathsFromUrl(url, realm);

  if (isGroupLink(url, realm)) {
    const recipients = paths[1].split('-')[0].split(',');
    return groupNarrow(
      recipients.map(recipient => getUserById(users, parseInt(recipient, 10)).email),
    );
  } else if (isTopicLink(url, realm)) {
    return topicNarrow(
      decodeURIComponent(transformToEncodedURI(paths[1])),
      decodeURIComponent(transformToEncodedURI(paths[3])),
    );
  } else if (isStreamLink(url, realm)) {
    return streamNarrow(decodeURIComponent(transformToEncodedURI(paths[1])));
  } else if (isSpecialLink(url, realm)) {
    return specialNarrow(paths[1]);
  }
  return [];
};

export const getMessageIdFromLink = (url: string, realm: string) => {
  const paths = getPathsFromUrl(url, realm);

  return isMessageLink(url, realm) ? parseInt(paths[paths.lastIndexOf('near') + 1], 10) : undefined;
};

const getResourceWithAuth = (uri: string, auth: Auth) => ({
  uri: getFullUrl(uri, auth.realm),
  headers: {
    Authorization: getAuthHeader(auth.email, auth.apiKey),
  },
});

const getResourceNoAuth = (uri: string) => ({
  uri,
});

export const getResource = (uri: string, auth: Auth): Object =>
  isUrlOnRealm(uri, auth.realm) ? getResourceWithAuth(uri, auth) : getResourceNoAuth(uri);

export const fixRealmUrl = (url: string) => {
  url = url.trim().replace(/\/$/, '');

  // Automatically prepend 'https://' if the user does not enter a protocol
  if (url.search(/\b(http|https):\/\//) === -1) {
    url = `https://${url}`;
  }

  return url;
};

export const getFileExtension = (filename: string): string => filename.split('.').pop();

const mimes = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  mov: 'video/quicktime',
};

export const getMimeTypeFromFileExtension = (extension: string): string =>
  mimes[extension.toLowerCase()] || 'application/octet-stream';
