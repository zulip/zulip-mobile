import * as ReactNative from 'react-native';

import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

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
  ReactNative.NativeModules.ZLPConstants =
    // Currently only available on iOS. We don't bother
    // conditionalizing on the platform here; if we want to mock
    // Platform.OS, we'll likely want to do so per-test. In that
    // scenario, we'll need to figure out how to recompute this mock
    // with Platform.OS set as desired.
    {
      resourceURL:
        'file:///private/var/containers/Bundle/Application/4DCD4D2B-F745-4C70-AD74-8E5F690CF593/ZulipMobile.app/',
    };
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
