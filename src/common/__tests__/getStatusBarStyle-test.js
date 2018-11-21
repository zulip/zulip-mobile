/* @flow */
import { DEFAULT_TITLE_BACKGROUND_COLOR } from '../../title/titleSelectors';
import { getStatusBarStyle } from '../ZulipStatusBar';

const themeNight = 'night';
const themeDefault = 'default';

describe('getStatusBarStyle', () => {
  test('return bar style according to given color, regardless of theme', () => {
    expect(getStatusBarStyle('#fff', 'black', themeDefault)).toEqual('dark-content');
    expect(getStatusBarStyle('#fff', 'black', themeNight)).toEqual('dark-content');
    expect(getStatusBarStyle('#000', 'white', themeDefault)).toEqual('light-content');
    expect(getStatusBarStyle('#000', 'white', themeNight)).toEqual('light-content');
  });

  test('return bar style according to theme in default-color case', () => {
    expect(getStatusBarStyle(DEFAULT_TITLE_BACKGROUND_COLOR, 'black', themeDefault)).toEqual(
      'dark-content',
    );
    expect(getStatusBarStyle(DEFAULT_TITLE_BACKGROUND_COLOR, 'black', themeNight)).toEqual(
      'light-content',
    );
  });
});
