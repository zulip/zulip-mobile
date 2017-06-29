jest.mock('react-native-sound', () => () => ({
  play: jest.fn(),
}));

jest.mock('react-native-simple-toast', () => () => ({
  SHORT: jest.fn(),
}));
