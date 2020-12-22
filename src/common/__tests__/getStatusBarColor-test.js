/* @flow strict-local */
import { DEFAULT_TITLE_BACKGROUND_COLOR } from '../../title/titleSelectors';
import { getStatusBarColor } from '../ZulipStatusBar';

const themeNight = 'night';
const themeDefault = 'default';

describe('getStatusBarColor', () => {
  test('returns specific color when given, regardless of theme', () => {
    expect(getStatusBarColor('#fff', themeDefault)).toEqual('#fff');
    expect(getStatusBarColor('#fff', themeNight)).toEqual('#fff');
  });

  test('returns color according to theme for default case', () => {
    expect(getStatusBarColor(DEFAULT_TITLE_BACKGROUND_COLOR, themeDefault)).toEqual('white');
    expect(getStatusBarColor(DEFAULT_TITLE_BACKGROUND_COLOR, themeNight)).toEqual(
      'hsl(212, 28%, 18%)',
    );
  });
});
