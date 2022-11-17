/* @flow strict-local */
import { objectEntries } from '../flowPonyfill';

/**
 * An object `encodeParamsForUrl` can flatten.
 *
 * In principle the values should be strings; but we include some other
 * primitive types for which `toString` is just as good as `JSON.stringify`.
 */
export type UrlParamValue = string | boolean | number;
export type UrlParams = $ReadOnly<{| [string]: UrlParamValue | void |}>;

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

/**
 * Test for an absolute URL, assuming a valid URL.
 *
 * Specifically, we assume the input is a "valid URL string" as defined by
 * the URL Standard:
 *   https://url.spec.whatwg.org/#url-writing
 * and return true just if it's an "absolute-URL-with-fragment string".
 *
 * If the input is not a valid URL string, the result is unspecified.
 */
export const isUrlAbsolute = (url: string): boolean =>
  // True just if the string starts with a "URL-scheme string", then `:`.
  // Every "absolute-URL string" must do so.
  // Every "relative-URL string" must not do so: either it starts with a
  //   "path-relative-scheme-less-URL string", or it starts with `/`.
  url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/) !== null;

/**
 * Test for a relative URL string, assuming a valid URL.
 *
 * Specifically, we assume the input is a "valid URL string" as defined by
 * the URL Standard:
 *   https://url.spec.whatwg.org/#url-writing
 * and return true just if it's a "relative-URL-with-fragment string".
 *
 * If the input is not a valid URL string, the result is unspecified.
 */
export const isUrlRelative = (url: string): boolean => !isUrlAbsolute(url);

/**
 * Test for a path-absolute URL string, assuming a valid URL.
 *
 * Specifically, we assume the input is a "valid URL string" as defined by
 * the URL Standard:
 *   https://url.spec.whatwg.org/#url-writing
 * and return true just if it's a "path-absolute-URL string".
 *
 * This is the kind like "/foo/bar" that keeps the part of the base URL
 * before the path, and replaces the rest.
 *
 * Specifically this is a kind of relative URL string: so when this returns
 * true (for a valid URL), `isUrlRelative` will always also return true and
 * `isUrlAbsolute` will return false.
 */
export const isUrlPathAbsolute = (url: string): boolean =>
  // A "path-absolute URL string" must start with `/` and not `//`.
  // On the other hand:
  //  * a "path-relative scheme-less-URL string" must not start with `/`;
  //  * the other forms of "relative-URL string" all must start with `//`.
  !!url.match(/^\/($|[^\/])/); // eslint-disable-line no-useless-escape
// ESLint says one of these slashes could be written unescaped.
//   But that seems like a recipe for confusion, so we escape them both.

/** Just like `new URL`, but on error return undefined instead of throwing. */
export const tryParseUrl = (url: string, base?: string | URL): URL | void => {
  try {
    return new URL(url, base);
  } catch {
    return undefined;
  }
};

/**
 * Test if the given URL is within the given realm.
 */
// This is used in and out of the WebView, so it must work with the native
// URL implementation and also the polyfill we use in React Native land.
export const isUrlOnRealm = (url: URL, realm: URL): boolean => url.origin === realm.origin;

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
