/* @flow strict-local */
import base64 from 'base-64';

export const xorHexStrings = (hex1: string, hex2: string) => {
  if (hex1.length !== hex2.length) {
    throw new Error('Both inputs must have the same length.');
  }

  return hex1
    .split('')
    .map((char, i) => (parseInt(hex1[i], 16) ^ parseInt(hex2[i], 16)).toString(16))
    .join('')
    .toUpperCase();
};

export const hexToAscii = (hex: string) => {
  let ascii = '';
  for (let i = 0; i < hex.length; i += 2) {
    ascii += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return ascii;
};

export const asciiToHex = (ascii: string) =>
  ascii
    .split('')
    .map(char => `0${char.charCodeAt(0).toString(16)}`.slice(-2))
    .join('')
    .toUpperCase();

export const base64ToHex = (bytes: string) => asciiToHex(base64.decode(bytes));

export const hexToBase64 = (hex: string) => base64.encode(hexToAscii(hex));

/**
 * Encode a string as the base64 representation of its UTF-8 bytes.
 *
 * This lets us pass an arbitrary string through a channel (like the
 * `postMessage` on RN's WebViews on Android) that tries to do something
 * like percent-decode it, or (like an HTML attribute) that forbids certain
 * characters.
 *
 * See also `base64Utf8Decode` for the inverse.
 */
export const base64Utf8Encode = (text: string): string =>
  // References on reliably encoding strings to Base64:
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  //
  // In short:
  //  * base64 encoders want bytes, not really Unicode strings, so they
  //    insist their input consist of the characters U+0000 to U+00FF;
  //  * `encodeURIComponent` together with `unescape` is a way of getting
  //    that, effectively producing the UTF-8 encoding of the input.
  //
  // We use `base64.encode` because `btoa` is unavailable in the JS
  // environment provided by RN on iOS.
  base64.encode(unescape(encodeURIComponent(text)));

/**
 * The inverse of `base64Utf8Encode`, above.
 */
export const base64Utf8Decode = (str: string): string =>
  decodeURIComponent(escape(base64.decode(str)));
