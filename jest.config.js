module.exports = {
  preset: 'react-native',
  globals: {
    __TEST__: true,
  },
  setupFilesAfterEnv: ['./jest/jestSetup.js'],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@expo/react-native-action-sheet|react-navigation)',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['./jest/globalFetch.js'],
};
