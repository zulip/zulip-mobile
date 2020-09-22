/* @flow strict-local */
import type { Auth } from '../types';
import { getAuthHeaders } from '../api/transport';
import objectEntries from './objectEntries';

/**
 * An object `encodeParamsForUrl` can flatten.
 *
 * In principle the values should be strings; but we include some other
 * primitive types for which `toString` is just as good as `JSON.stringify`.
 */
export type UrlParamValue = string | boolean | number;
export type UrlParams = $ReadOnly<{ [string]: UrlParamValue | void }>;

/**
 * Encode parameters as if for the URL query-part submitting an HTML form.
 *
 * Following the pattern of JSON.stringify, drop (rather than encoding in any
 * fashion) parameters whose provided value is `undefined`.
 */
export const encodeParamsForUrl = (params: UrlParams): string =>
  objectEntries(params)
    /* Filter out entries with `undefined` values, with type-level recognition.
       (Flow's core definitions treat `.filter(Boolean)` as a special case. See
       https://github.com/facebook/flow/issues/1414 for more information.) */
    .map(([key, value]): ?[string, UrlParamValue] => (value === undefined ? null : [key, value]))
    .filter(Boolean)
    /* Encode. */
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
    .join('&');

/** Just like `new URL`, but on error return undefined instead of throwing. */
export const tryParseUrl = (url: string, base?: string | URL): URL | void => {
  try {
    return new URL(url, base);
  } catch (e) {
    return undefined;
  }
};

// TODO: Work out what this does, write a jsdoc for its interface, and
// reimplement using URL object (not just for the realm)
export const isUrlOnRealm = (url: string = '', realm: URL): boolean =>
  url.startsWith('/') || url.startsWith(realm.toString()) || !/^(http|www.)/i.test(url);

const getResourceWithAuth = (uri: string, auth: Auth) => ({
  uri: new URL(uri, auth.realm).toString(),
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

export type Protocol = 'https://' | 'http://';

const protocolRegex = /^\s*((?:http|https):\/\/)(.*)$/;

const hasProtocol = (url: string = '') => url.search(protocolRegex) !== -1;

// Split a (possible) URL into protocol and non-protocol parts.
// The former will be null if no recognized protocol is a component
// of the string.
//
// Ignores initial spaces.
/** PRIVATE -- exported only for testing */
export const parseProtocol = (value: string): [Protocol | null, string] => {
  const match = protocolRegex.exec(value);

  if (match) {
    const [, protocol, rest] = match;
    if (protocol === 'http://' || protocol === 'https://') {
      return [protocol, rest];
    } else {
      throw new Error(`impossible match: protocol = '${escape(protocol)}'`);
    }
  }
  return [null, value];
};

export const fixRealmUrl = (url: string = '') => {
  if (url === '') {
    return '';
  }
  const trimmedUrl = url
    .replace(/\s/g, '') // strip any spaces, internal or otherwise
    .replace(/\/+$/, ''); // eliminate trailing slash(es)

  return hasProtocol(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
};

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

export type AutocompletionDefaults = {|
  protocol: Protocol,
  domain: string,
|};

export type AutocompletionPieces = [Protocol | null, string, string | null];

/**
 * A short list of some characters not permitted in subdomain name elements.
 */
const disallowedCharacters: Array<string> = [...'.:/'];

/**
 * Given user input purporting to identify a Zulip realm, provide a prefix,
 * derived value, and suffix which may suffice to turn it into a full URL.
 *
 * Presently, the derived value will always be equal to the input value;
 * this property should not be relied on, as it may change in future.
 */
export const autocompleteRealmPieces = (
  value: string,
  defaults: AutocompletionDefaults,
): AutocompletionPieces => {
  const [protocol, nonProtocolValue] = parseProtocol(value);

  const prefix = protocol === null ? defaults.protocol : null;

  // If the user supplies one of these characters, assume they know what they're doing.
  const suffix = disallowedCharacters.some(c => nonProtocolValue.includes(c))
    ? null
    : `.${defaults.domain}`;

  return [prefix, value, suffix];
};

export const autocompleteRealm = (value: string, data: AutocompletionDefaults): string =>
  value === ''
    ? ''
    : autocompleteRealmPieces(value, data)
        .filter(s => s)
        .join('');
