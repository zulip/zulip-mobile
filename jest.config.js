module.exports = {
  preset: 'react-native',

  // Finding and transforming source code.
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@expo/react-native-action-sheet|react-navigation)',
  ],

  // The runtime test environment.
  globals: {
    __TEST__: true,
  },
  setupFiles: ['./jest/globalFetch.js'],
  setupFilesAfterEnv: ['./jest/jestSetup.js'],
};
