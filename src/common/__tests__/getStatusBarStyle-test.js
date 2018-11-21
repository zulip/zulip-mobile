/* @flow */
import { DEFAULT_TITLE_BACKGROUND_COLOR } from '../../title/titleSelectors';
import { getStatusBarStyle } from '../ZulipStatusBar';

const themeNight = 'night';
const themeDefault = 'default';

describe('getStatusBarStyle', () => {
  test('return bar style according to given color, regardless of theme', () => {
    expect(getStatusBarStyle('#fff', themeDefault)).toEqual('dark-content');
    expect(getStatusBarStyle('#fff', themeNight)).toEqual('dark-content');
    expect(getStatusBarStyle('#000', themeDefault)).toEqual('light-content');
    expect(getStatusBarStyle('#000', themeNight)).toEqual('light-content');
  });

  test('return bar style according to theme in default-color case', () => {
    expect(getStatusBarStyle(DEFAULT_TITLE_BACKGROUND_COLOR, themeDefault)).toEqual('dark-content');
    expect(getStatusBarStyle(DEFAULT_TITLE_BACKGROUND_COLOR, themeNight)).toEqual('light-content');
  });
});
