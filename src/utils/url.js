/* @flow strict-local */
import urlRegex from 'url-regex';

import type { Auth } from '../types';
import { getAuthHeaders } from '../api/transport';

/**
 * An object `encodeParamsForUrl` can flatten.
 *
 * In principle the values should be strings; but we include some other
 * primitive types for which `toString` is just as good as `JSON.stringify`.
 */
export type UrlParams = $ReadOnly<{ [string]: string | boolean | number }>;

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

const getResourceWithAuth = (uri: string, auth: Auth) => ({
  uri: getFullUrl(uri, auth.realm),
  headers: getAuthHeaders(auth),
});

const getResourceNoAuth = (uri: string) => ({
  uri,
});

export const getResource = (
  uri: string,
  auth: Auth,
): {| uri: string, headers?: { [string]: string } |} =>
  isUrlOnRealm(uri, auth.realm) ? getResourceWithAuth(uri, auth) : getResourceNoAuth(uri);

const protocolRegex = /^\s*((?:http|https):\/\/)(.*)$/;

/** DEPRECATED */
export const hasProtocol = (url: string = '') => url.search(protocolRegex) !== -1;

// Split a (possible) URL into protocol and non-protocol parts.
// The former will be null if no recognized protocol is a component
// of the string.
//
// Ignores initial spaces.
/** PRIVATE -- exported only for testing */
export const parseProtocol = (value: string): [string | null, string] => {
  const match = protocolRegex.exec(value);
  return match ? [match[1], match[2]] : [null, value];
};

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
