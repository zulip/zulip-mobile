import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';

jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

jest.mock('react-native-sound', () => () => ({
  play: jest.fn(),
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

jest.mock('react-native-simple-toast', () => ({
  SHORT: 2.0,
  LONG: 3.5,
  TOP: 3,
  BOTTOM: 1,
  CENTER: 2,
  show: jest.fn(),
  showWithGravity: jest.fn(),
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '26.23.146',
}));
