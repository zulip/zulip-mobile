import { colorHashFromName, initialsFromName } from '../TextAvatar';

describe('colorHashFromName', () => {
  test('returns a 6 digit hex number to use as a color ', () => {
    const hash = colorHashFromName('John Doe');
    expect(hash.length).toEqual(7);
  });

  test('produces the same output for the same input', () => {
    const hash1 = colorHashFromName('John Doe');
    const hash2 = colorHashFromName('John Doe');
    expect(hash1).toEqual(hash2);
  });
});

describe('initialsFromName', () => {
  test('empty string returns empty strings of initials', () => {
    const initials = initialsFromName('');
    expect(initials).toEqual('');
  });

  test('a single name has a single letter initial', () => {
    const initials = initialsFromName('John');
    expect(initials).toEqual('J');
  });

  test('two names result in two initials', () => {
    const initials = initialsFromName('John Doe');
    expect(initials).toEqual('JD');
  });

  test('initials are always upper case', () => {
    const initials = initialsFromName('small caps');
    expect(initials).toEqual('SC');
  });

  test('double names produce one initial', () => {
    expect(initialsFromName('Jean-Pierre')).toEqual('J');
    expect(initialsFromName("Mc'Donald")).toEqual('M');
  });
});
