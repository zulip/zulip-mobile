import base64 from 'base-64';
import {Auth} from '../api/apiFetch';

export const getAuthHeader = (email: string, apiKey: string): ?string =>
  apiKey ? `Basic ${base64.encode(`${email}:${apiKey}`)}` : undefined;

export const encodeAsURI = (params): string =>
  Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

export const getFullUrl = (url: string, realm: string): string =>
  url.startsWith('/') ? `${realm}${url}` : url;

export const isUrlOnRealm = (url: string, realm: string): boolean =>
  url.startsWith('/') || url.startsWith(realm);

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
  isUrlOnRealm(uri, auth.realm)
    ? getResourceWithAuth(uri, auth)
    : getResourceNoAuth(uri);
