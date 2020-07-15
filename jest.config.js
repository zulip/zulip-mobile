// Modules in `node_modules` which are published in uncompiled form, and
// therefore need to be compiled by Babel before Jest can use them.
//
// These will be used as regexp fragments.
const transformModulesWhitelist = [
  'expo-apple-authentication',
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

module.exports = {
  preset: 'react-native',

  // Finding and transforming source code.

  testPathIgnorePatterns: ['/node_modules/', '/src/__tests__/lib/'],

  // When some source file foo.js says `import 'bar'`, Jest looks in the
  // directories above foo.js for a directory like `node_modules` to find
  // `bar` in.  If foo.js is behind a `yarn link` symlink and outside our
  // tree, that won't work; so have it look at our node_modules too.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],

  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: [transformIgnorePattern],

  // The runtime test environment.
  globals: {
    __TEST__: true,
  },
  setupFiles: ['./jest/globalFetch.js'],
  setupFilesAfterEnv: ['./jest/jestSetup.js', 'jest-extended'],
};
