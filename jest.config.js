module.exports = {
  preset: 'react-native',

  // Finding and transforming source code.

  testPathIgnorePatterns: ['/node_modules/'],

  // When some source file foo.js says `import 'bar'`, Jest looks in the
  // directories above foo.js for a directory like `node_modules` to find
  // `bar` in.  If foo.js is behind a `yarn link` symlink and outside our
  // tree, that won't work; so have it look at our node_modules too.
  moduleDirectories: ['node_modules', '<rootDir>/node_modules'],

  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: [
    // Transform everything *but* most things in node_modules... but do
    // transform those covered by the pattern inside the `(?!)`.
    'node_modules/(?!react-native|@expo/react-native-action-sheet|react-navigation|@zulip/)',
  ],

  // The runtime test environment.
  globals: {
    __TEST__: true,
  },
  setupFiles: ['./jest/globalFetch.js'],
  setupFilesAfterEnv: ['./jest/jestSetup.js', 'jest-extended'],
};
