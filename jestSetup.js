jest.mock('react-native-sound', () => () => ({
  play: jest.fn(),
}));

jest.mock('react-native-snackbar', () => () => ({
  LENGTH_LONG: jest.fn(),
}));
