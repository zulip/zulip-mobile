/* @flow strict-local */
import base64 from 'base-64';
import urlRegex from 'url-regex';

import type { Auth, Narrow, User } from '../types';
import { HOME_NARROW, topicNarrow, streamNarrow, groupNarrow, specialNarrow } from './narrow';
import { transformToEncodedURI } from './string';
import { NULL_USER } from '../nullObjects';

/**
 * An object `encodeParamsForUrl` can flatten.
 *
 * In principle the values should be strings; but we include some other
 * primitive types for which `toString` is just as good as `JSON.stringify`.
 */
export type UrlParams = { [string]: string | boolean | number };

export const getPathsFromUrl = (url: string = '', realm: string) => {
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

/** Encode parameters as if for the URL query-part submitting an HTML form. */
export const encodeParamsForUrl = (params: UrlParams): string =>
  Object.keys(params)
    // An `undefined` can sneak in because `JSON.stringify(undefined)` is
    // `undefined`, but its signature lies that it returns just `string`.
    .filter((key: string) => params[key] !== undefined)
    .map(
      (key: string) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`,
    )
    .join('&');

export const getFullUrl = (url: string = '', realm: string): string =>
  !url.startsWith('http') ? `${realm}${url.startsWith('/') ? '' : '/'}${url}` : url;

export const isUrlOnRealm = (url: string = '', realm: string): boolean =>
  url.startsWith('/') || url.startsWith(realm) || !/^(http|www.)/i.test(url);

export const isUrlInAppLink = (url: string, realm: string): boolean =>
  isUrlOnRealm(url, realm) ? /^(\/#narrow|#narrow)/i.test(url.split(realm).pop()) : false;

export const isMessageLink = (url: string, realm: string): boolean =>
  isUrlInAppLink(url, realm) && url.includes('near');

export const isTopicLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isUrlInAppLink(url, realm)
    && ((paths.length === 4 || paths.length === 6)
      && paths[0] === 'stream'
      && (paths[2] === 'subject' || paths[2] === 'topic'))
  );
};

export const isGroupLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isUrlInAppLink(url, realm)
    && ((paths.length === 2 && paths[0] === 'pm-with')
      || (paths.length === 4 && paths[0] === 'pm-with' && paths[2] === 'near'))
  );
};

export const isStreamLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return isUrlInAppLink(url, realm) && paths.length === 2 && paths[0] === 'stream';
};

export const isSpecialLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isUrlInAppLink(url, realm)
    && paths.length === 2
    && paths[0] === 'is'
    && /^(private|starred|mentioned)/i.test(paths[1])
  );
};

export const isEmojiUrl = (url: string, realm: string): boolean =>
  isUrlOnRealm(url, realm) && url.includes('/static/generated/emoji/images/emoji/unicode/');

export const getEmojiUrl = (unicode: string): string =>
  `/static/generated/emoji/images/emoji/unicode/${unicode}.png`;

export const getNarrowFromLink = (
  url: string,
  realm: string,
  usersById: Map<number, User>,
): Narrow => {
  const paths = getPathsFromUrl(url, realm);

  if (isGroupLink(url, realm)) {
    const recipients = paths[1].split('-')[0].split(',');
    return groupNarrow(
      recipients.map(
        (recipient: string) => (usersById.get(parseInt(recipient, 10)) || NULL_USER).email,
      ),
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

  return HOME_NARROW;
};

export const getMessageIdFromLink = (url: string, realm: string): number => {
  const paths = getPathsFromUrl(url, realm);

  return isMessageLink(url, realm) ? parseInt(paths[paths.lastIndexOf('near') + 1], 10) : 0;
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

export const getResource = (
  uri: string,
  auth: Auth,
): {| uri: string, headers?: { [string]: ?string } |} =>
  isUrlOnRealm(uri, auth.realm) ? getResourceWithAuth(uri, auth) : getResourceNoAuth(uri);

export const hasProtocol = (url: string = '') => url.search(/\b(http|https):\/\//) !== -1;

export const fixRealmUrl = (url: string = '') =>
  url.length > 0 ? (!hasProtocol(url) ? 'https://' : '') + url.trim().replace(/\s+|\/$/g, '') : '';

export const getFileExtension = (filename: string): string => filename.split('.').pop();

export const isUrlAnImage = (url: string): boolean =>
  ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(getFileExtension(url).toLowerCase());

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

export const autocompleteUrl = (value: string = '', protocol: string, append: string): string =>
  value.length > 0
    ? `${hasProtocol(value) ? '' : protocol}${value || 'your-org'}${
        value.indexOf('.') === -1 ? append : ''
      }`
    : '';

export const isValidUrl = (url: string): boolean => urlRegex({ exact: true }).test(url);
