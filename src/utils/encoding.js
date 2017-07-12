/* @flow */
import base64 from 'base-64';
import { NativeModules } from 'react-native';

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

// Returns a one time pad (OTP) as a hex string
// Uses the native platform random number generator
export const generateOtp = async () => {
  const rand = await NativeModules.UtilManager.randomBase64(32);
  return base64ToHex(rand);
};

// Extract an API key encoded as a hex string XOR'ed with a one time pad (OTP)
// (this is used during the OAuth flow)
export const extractApiKey = (encoded: string, otp: string) =>
  hexToAscii(xorHexStrings(encoded, otp));
