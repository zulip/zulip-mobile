/* @flow */
import deepFreeze from 'deep-freeze';

import { homeNarrow, streamNarrow, privateNarrow } from '../narrow';
import getStatusBarStyle from '../getStatusBarStyle';
import { getTitleBackgroundColor } from '../../selectors';
import { navStateWithNarrow } from '../../utils/testHelpers';

const themeDefault = 'default';

const darkTextColor = 'black';

const DARK_CONTENT_STYLE = 'dark-content';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getStatusBarStyle', () => {
  test('return bar style according to theme for screens other than main', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(homeNarrow),
      subscriptions,
    });

    const result = getStatusBarStyle(getTitleBackgroundColor(state), darkTextColor, themeDefault);

    expect(result).toEqual(DARK_CONTENT_STYLE);
  });

  test('return bar style according to text color for stream and topic narrow in main screen', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(streamNarrow('all')),
      subscriptions,
    });

    const result = getStatusBarStyle(state, darkTextColor, themeDefault);

    expect(result).toEqual(DARK_CONTENT_STYLE);
  });

  test('returns style according to theme for private, group, home and special narrow', () => {
    const state = deepFreeze({
      ...navStateWithNarrow(privateNarrow('abc@zulip.com')),
      subscriptions,
    });

    const result = getStatusBarStyle(state, darkTextColor, themeDefault);

    expect(result).toEqual(DARK_CONTENT_STYLE);
  });
});
