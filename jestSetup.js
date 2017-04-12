jest.mock('react-native-sound', () => () => ({
  play: jest.fn(),
}));
