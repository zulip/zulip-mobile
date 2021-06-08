/* @flow strict-local */
/* eslint-disable global-require */
import * as ReactNative from 'react-native';
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';
import { URL, URLSearchParams } from 'react-native-url-polyfill';
// $FlowIgnore[untyped-import] - this is not anywhere near critical
import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

// Use the same `URL` polyfill we do in the app.
//
// In the app we let `react-native-url-polyfill` handle doing this, by
// importing `react-native-url-polyfill/auto`.  But in Jest, that produces
// warnings apparently due to the lazy `require(…)` calls in the getters
// provided for the polyfill; perhaps from them getting invoked by the Jest
// framework after the test environment has been torn down.
//   https://github.com/zulip/zulip-mobile/pull/4350#issuecomment-749247080
// So we mimic the library's way of doing the polyfill, except we do the
// imports eagerly so there's no dynamic `require`.
polyfillGlobal('URL', () => URL);
polyfillGlobal('URLSearchParams', () => URLSearchParams);

// Mock `react-native` ourselves, following upstream advice [1] [2].
//
// Note that React Native's Jest setup (in their jest/setup.js)
// means that most of `react-native` is already mocked; we add to that
// here.
//
// We can't do `ReactNative.Foo = ...` because all properties Foo on
// the react-native module have getters but no setters. But we can set
// properties freely at the next level down:
//
// ReactNative.Foo.Bar = ...
//
// Or set multiple properties at this level, together:
// `Object.assign(ReactNative.Foo, { ... })`.
//
// If we *really* want to replace a top-level property:
//
// Object.defineProperty(ReactNative, "Foo", { ... });
//
// [1] https://github.com/facebook/react-native/issues/26579#issuecomment-535244001
// [2] https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/.23M3781.20RN.20v0.2E61.20upgrade/near/931219
jest.mock('react-native', () => {
  if (ReactNative.Platform.OS === 'ios') {
    ReactNative.NativeModules.ZLPConstants = {
      resourceURL:
        'file:///private/var/containers/Bundle/Application/4DCD4D2B-F745-4C70-AD74-8E5F690CF593/ZulipMobile.app/',
    };
  } else if (ReactNative.Platform.OS === 'android') {
    const header = 'z|mock|';
    ReactNative.NativeModules.TextCompressionModule = {
      header,
      compress: jest.fn(
        async (input: string) => `${header}${Buffer.from(input).toString('base64')}`,
      ),
      decompress: jest.fn(async (input: string) =>
        Buffer.from(input.replace(header, ''), 'base64').toString('utf8'),
      ),
    };
  }

  return ReactNative;
});

/**
 * Boring mocks
 *
 * We aren't interested in any specific data in these mocks; they just
 * make things not break. Usually it's because these JS modules depend
 * on something being available on NativeModules, and we'd rather not
 * mock that precisely, as it's an implementation detail that may
 * change.
 *
 * If Jest complains about syntax errors in a module in node_modules,
 * it's likely because the only code it finds for the module is modern
 * JavaScript that needs to be transformed by Babel. In that case, try
 * adding the module to `transformModulesWhitelist` in our Jest config
 * before mocking it here.
 */

// As instructed at https://reactnavigation.org/docs/testing/.
jest.mock('react-native-reanimated', () => {
  /* $FlowIgnore[untyped-import] - This is just a mock setup file; no
     need for a libdef. */
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock('react-native-sound', () => () => ({
  play: jest.fn(),
}));

jest.mock('rn-fetch-blob', () => ({
  DocumentDir: () => {},
}));

jest.mock('react-native-simple-toast', () => ({
  SHORT: 2.0,
  LONG: 3.5,
  TOP: 3,
  BOTTOM: 1,
  CENTER: 2,
  show: jest.fn(),
  showWithGravity: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getSystemName: jest.fn().mockReturnValue('ios'),
  getSystemVersion: jest.fn().mockReturnValue('13.3.1'),
}));

// Upstream says [1] to mock the native module. We could do that,
// above, if we wanted to. But mocking the module's public interface
// (the default export of `react-native-image-picker` ) is more robust
// to changes in the native module. The method names on the native
// module are all reflected in the public interface, so this is easy.
// https://github.com/react-native-community/react-native-image-picker/blob/v2.3.2/src/internal/nativeInterface.ts#L23
jest.mock('react-native-image-picker', () => ({
  showImagePicker: jest.fn(),
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Set up our `logging` module with mocks, which tests can use as desired.
//
// This global version just passes the calls right through to the real
// implementations.  To suppress logging in a specific test, make a call
// like `logging.warn.mockReturnValue()`.  For more, see:
//   https://jestjs.io/docs/en/mock-function-api
// or search our code for `logging.warn.` for examples.
jest.mock('../src/utils/logging', () => {
  const logging = jest.requireActual('../src/utils/logging');
  return {
    __esModule: true, // eslint-disable-line id-match
    error: jest.fn().mockImplementation(logging.error),
    warn: jest.fn().mockImplementation(logging.warn),
  };
});
