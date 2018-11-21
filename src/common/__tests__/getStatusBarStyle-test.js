/* @flow */
import { DEFAULT_TITLE_BACKGROUND_COLOR } from '../../title/titleSelectors';
import { getStatusBarStyle } from '../ZulipStatusBar';

const themeDefault = 'default';
const darkTextColor = 'black';
const DARK_CONTENT_STYLE = 'dark-content';

describe('getStatusBarStyle', () => {
  test('return bar style according to color given', () => {
    expect(getStatusBarStyle('#fff', darkTextColor, themeDefault)).toEqual(DARK_CONTENT_STYLE);
  });

  test('return bar style according to theme for default case', () => {
    expect(getStatusBarStyle(DEFAULT_TITLE_BACKGROUND_COLOR, darkTextColor, themeDefault)).toEqual(
      DARK_CONTENT_STYLE,
    );
  });
});
