import 'react-native';
import { colorHashFromName, initialsFromName } from '../TextAvatar';

test('colorHashFromName', () => {
  const hash = colorHashFromName('John Doe');
  expect(hash.length).toEqual(7);
});

test('colorHashFromName', () => {
  const hash1 = colorHashFromName('John Doe');
  const hash2 = colorHashFromName('John Doe');
  expect(hash1).toEqual(hash2);
});

test('initialsFromName', () => {
  const initials = initialsFromName('John');
  expect(initials).toEqual('J');
});

test('initialsFromName', () => {
  const initials = initialsFromName('John Doe');
  expect(initials).toEqual('JD');
});

test('initialsFromName', () => {
  const initials = initialsFromName('small caps');
  expect(initials).toEqual('SC');
});

test('initialsFromName', () => {
  const initials = initialsFromName('Jean-Pierre Doe');
  expect(initials).toEqual('JD');
});
