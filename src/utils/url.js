import base64 from 'base-64';
import { Auth } from '../api/apiFetch';
import { topicNarrow, streamNarrow, groupNarrow, specialNarrow } from './narrow';
import { getUserById } from '../users/usersSelectors';

export const getAuthHeader = (email: string, apiKey: string): ?string =>
  (apiKey ? `Basic ${base64.encode(`${email}:${apiKey}`)}` : undefined);

export const encodeAsURI = (params): string =>
  Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

export const getFullUrl = (url: string, realm: string): string =>
  (url.startsWith('/') ? `${realm}${url}` : url);

export const isUrlOnRealm = (url: string, realm: string): boolean =>
  url.startsWith('/') || url.startsWith(realm);

export const isUrlInAppLink = (url: string, realm: string): boolean =>
  (isUrlOnRealm(url, realm) ? url.split(realm).pop().startsWith('/#narrow') : false);

export const isMessageLink = (url: string, realm: string): boolean =>
  isUrlInAppLink(url, realm) && url.includes('near');

export const isTopicLink = (url: string, realm: string): boolean =>
  isUrlInAppLink(url, realm) && url.includes('topic');

export const isGroupLink = (url: string, realm: string): boolean =>
  isUrlInAppLink(url, realm) && url.includes('pm-with');

export const isStreamLink = (url: string, realm: string): boolean =>
  isUrlInAppLink(url, realm) && url.includes('stream');

export const isSpecialLink = (url: string, realm: string): boolean =>
  isUrlInAppLink(url, realm) && url.includes('is');

export const getNarrowFromLink = (url: string, realm: string, users: []): [] => {
  const paths = url.split(realm).pop().split('/');
  if (isGroupLink(url, realm)) {
    const recipients = paths[paths.length - 1].split('-')[0].split(',');
    return groupNarrow(
      recipients.map(recipient => getUserById(users, parseInt(recipient, 10)).email),
    );
  } else if (isTopicLink(url, realm)) {
    return topicNarrow(
      decodeURIComponent(paths[paths.lastIndexOf('stream') + 1].replace(/\./g, '%')),
      decodeURIComponent(paths[paths.lastIndexOf('topic') + 1].replace(/\./g, '%')),
    );
  } else if (isStreamLink(url, realm)) {
    return streamNarrow(
      decodeURIComponent(paths[paths.lastIndexOf('stream') + 1].replace(/\./g, '%')),
    );
  } else if (isSpecialLink(url, realm)) {
    return specialNarrow(paths[paths.length - 1]);
  }
  return [];
};

export const getMessageIdFromLink = (url: string, realm: string) => {
  const paths = url.split(realm).pop().split('/');
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

export const getResource = (uri: string, auth: Auth) =>
  (isUrlOnRealm(uri, auth.realm) ? getResourceWithAuth(uri, auth) : getResourceNoAuth(uri));
