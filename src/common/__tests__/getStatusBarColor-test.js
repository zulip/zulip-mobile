/* @flow strict-local */
import { getStatusBarColor } from '../ZulipStatusBar';

const themeNight = 'night';
const themeDefault = 'default';

describe('getStatusBarColor', () => {
  test('returns specific color when given, regardless of theme', () => {
    expect(getStatusBarColor('#fff', themeDefault)).toEqual('#fff');
    expect(getStatusBarColor('#fff', themeNight)).toEqual('#fff');
  });

  test('returns color according to theme for default case', () => {
    expect(getStatusBarColor(undefined, themeDefault)).toEqual('white');
    expect(getStatusBarColor(undefined, themeNight)).toEqual('hsl(212, 28%, 18%)');
  });
});
