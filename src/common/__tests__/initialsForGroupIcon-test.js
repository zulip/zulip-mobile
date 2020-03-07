/* @flow strict-local */
import { initialsForGroupIcon } from '../GroupAvatar';

describe('initialsForGroupIcon', () => {
  test('empty string returns empty strings of initials', () => {
    expect(initialsForGroupIcon([''])).toEqual('');
  });

  test('a single name has a single letter initial', () => {
    expect(initialsForGroupIcon(['John'])).toEqual('J');
    expect(initialsForGroupIcon(['John Doe'])).toEqual('J');
    expect(initialsForGroupIcon(['Ruby Donald Johnny Doe'])).toEqual('R');
  });

  test('initials are always upper case', () => {
    expect(initialsForGroupIcon(['small caps'])).toEqual('S');
    expect(initialsForGroupIcon(['john', 'doe'])).toEqual('JD');
  });

  test('double names produce one initial', () => {
    expect(initialsForGroupIcon(['Jean-Pierre'])).toEqual('J');
    expect(initialsForGroupIcon(["Mc'Donald"])).toEqual('M');
  });

  test('four names or less should produce the respective names initials', () => {
    expect(initialsForGroupIcon(['John', 'Doe', 'Ruby', 'Mathew'])).toEqual('JDRM');
    expect(initialsForGroupIcon(['Doe', 'Ruby'])).toEqual('DR');
  });

  test("more than four names should have a '…' charector after the first 3 initials", () => {
    expect(initialsForGroupIcon(['John', 'Doe', 'Ruby', 'Mat', 'Sam'])).toEqual('JDR…');
  });

  test('should work on emojis', () => {
    expect(initialsForGroupIcon(['😁Me', 'test'])).toEqual('😁T');
  });
});
