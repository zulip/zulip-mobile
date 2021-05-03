// Modules in `node_modules` which are published in uncompiled form, and
// therefore need to be compiled by Babel before Jest can use them.
//
// These will be used as regexp fragments.
const transformModulesWhitelist = [
  'expo-apple-authentication',
  'expo-application',
  'react-native',
  // @rnc/async-storage itself is precompiled, but its mock-helper is not
  '@react-native-community/async-storage',
  '@react-native-community/cameraroll',
  '@expo/react-native-action-sheet',
  'react-navigation',
  '@sentry/react-native',
  '@unimodules/',
  '@zulip/',
];

// The rest of `node_modules`, however, should not be transformed. We express this
// with a negative-lookahead suffix, as suggested in the Jest docs:
//
//   https://jestjs.io/docs/en/tutorial-react-native#transformignorepatterns-customization
//
// (This value is correctly a string, not a RegExp.)
const transformIgnorePattern = `node_modules/(?!${transformModulesWhitelist.join('|')})`;

const projectForPlatform = platform => {
  if (!['ios', 'android'].includes(platform)) {
    throw new Error(`Unsupported platform '${platform}'.`);
  }
  return {
    displayName: platform,

    // Ideally, these would simply be `jest-expo/ios` and
    // `jest-expo/android`; see
    // https://github.com/expo/expo/blob/master/packages/jest-expo/README.md#platforms.
    // These custom presets are a workaround for a bug:
    //
    // `jest-expo`'s presets are based on `react-native`'s preset,
    // which does something messy: it overwrites the global `Promise`.
    // That's facebook/react-native#29303. Jest doesn't work well with
    // that; that's facebook/jest#10221.
    //
    // So, until one of those is fixed, we use these custom presets to
    // sandwich the code that replaces `global.Promise` with a fix:
    //
    // 1) save `global.Promise` to something else on `global`
    // 2) let the `react-native` preset do its thing (like mocking RN
    //    libraries)
    // 3) assign `global.Promise` back to what we saved in step 1
    preset: platform === 'ios' ? './jest/presetIos' : './jest/presetAndroid',

    //
    //
    // Config for finding and transforming source code.
    //

    testPathIgnorePatterns: ['/node_modules/', '/src/__tests__/lib/', '-testlib.js$'],

    // When some source file foo.js says `import 'bar'`, Jest looks in the
    // directories above foo.js for a directory like `node_modules` to find
    // `bar` in.  If foo.js is behind a `yarn link` symlink and outside our
    // tree, that won't work; so have it look at our node_modules too.
    moduleDirectories: ['node_modules', '<rootDir>/node_modules'],

    transform: {
      '^.+\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
    },
    transformIgnorePatterns: [transformIgnorePattern],

    //
    //
    // Config for the runtime test environment.
    //

    globals: {
      __TEST__: true,
    },
    setupFiles: [
      './jest/globalFetch.js',
      './node_modules/react-native-gesture-handler/jestSetup.js',
    ],
    setupFilesAfterEnv: ['./jest/jestSetup.js', 'jest-extended'],
  };
};

module.exports = {
  // The substantive difference between these two is whether `foo.ios.js`
  // or `foo.android.js` is used.  In particular that also has the effect
  // of controlling the value of `Platform.OS`.
  projects: [projectForPlatform('ios'), projectForPlatform('android')],
};
