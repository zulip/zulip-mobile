/* @flow strict-local */
import { getStatusBarStyle } from '../ZulipStatusBar';

describe('getStatusBarStyle', () => {
  test('return bar style according to given color', () => {
    expect(getStatusBarStyle('#fff')).toEqual('dark-content');
    expect(getStatusBarStyle('#000')).toEqual('light-content');
  });
});
