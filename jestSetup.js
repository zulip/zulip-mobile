jest.mock('react-native-sound', () => () => ({
  play: jest.fn(),
}));

jest.mock('react-native-fetch-blob', () => ({
  DocumentDir: jest.fn(),
}));
