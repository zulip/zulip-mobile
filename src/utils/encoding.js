/* @flow */
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

/** Encode a JavaScript string to a string in Base64 format. */
export const strToBase64 = (text: string): string =>
  // References on reliably encoding strings to Base64:
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  base64.encode(unescape(encodeURIComponent(text)));

// Extract an API key encoded as a hex string XOR'ed with a one time pad (OTP)
// (this is used during the OAuth flow)
export const extractApiKey = (encoded: string, otp: string) =>
  hexToAscii(xorHexStrings(encoded, otp));
