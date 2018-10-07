jest.mock('react-native-sound', () => () => ({
  play: jest.fn(),
}));

jest.mock('react-native-simple-toast', () => () => ({
  SHORT: jest.fn(),
}));

jest.mock('Linking', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn(),
}));

jest.mock('rn-fetch-blob', () => ({
  DocumentDir: () => {},
}));
