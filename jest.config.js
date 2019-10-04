module.exports = {
  preset: 'react-native',

  // Finding and transforming source code.
  testPathIgnorePatterns: ['/node_modules/'],
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
  setupFilesAfterEnv: ['./jest/jestSetup.js'],
};
