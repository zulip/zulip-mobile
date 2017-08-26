/* @flow */
import deepFreeze from 'deep-freeze';

import { streamNarrow, topicNarrow, privateNarrow, specialNarrow, groupNarrow } from '../narrow';
import getStatusBarStyle from '../getStatusBarStyle';
import { getTitleBackgroundColor } from '../../selectors';

const themeNight = 'night';
const themeDefault = 'default';

const darkTextColor = 'black';
const lightTextColor = 'white';

const LIGHT_CONTENT_STYLE = 'light-content';
const DARK_CONTENT_STYLE = 'dark-content';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getStatusBarStyle', () => {
  test('return bar style according to theme for screens other than main', () => {
    const state = deepFreeze({ chat: { narrow: [] }, subscriptions });
    expect(getStatusBarStyle(getTitleBackgroundColor(state), darkTextColor, themeDefault)).toEqual(
      DARK_CONTENT_STYLE,
    );
  });

  test('return bar style according to text color for stream and topic narrow in main screen', () => {
    let state = deepFreeze({ chat: { narrow: streamNarrow('all') }, subscriptions });
    expect(getStatusBarStyle(state, darkTextColor, themeDefault)).toEqual(DARK_CONTENT_STYLE);

    state = deepFreeze({ chat: { narrow: topicNarrow('all', 'announce') }, subscriptions });
    expect(getStatusBarStyle(state, lightTextColor, themeDefault)).toEqual(LIGHT_CONTENT_STYLE);
  });

  test('returns style according to theme for private, group, home and special narrow', () => {
    let state = deepFreeze({ chat: { narrow: privateNarrow('abc@zulip.com') }, subscriptions });
    expect(getStatusBarStyle(state, darkTextColor, themeDefault)).toEqual(DARK_CONTENT_STYLE);

    expect(getStatusBarStyle(state, lightTextColor, themeNight)).toEqual(LIGHT_CONTENT_STYLE);

    state = deepFreeze({ chat: { narrow: [] }, subscriptions });
    expect(getStatusBarStyle(state, darkTextColor, themeDefault)).toEqual(DARK_CONTENT_STYLE);

    state = deepFreeze({
      chat: { narrow: groupNarrow(['abc@zulip.com', 'def@zulip.com']) },
      subscriptions,
    });
    expect(getStatusBarStyle(state, darkTextColor, themeDefault)).toEqual(DARK_CONTENT_STYLE);

    state = deepFreeze({ chat: { narrow: specialNarrow('private') }, subscriptions });
    expect(getStatusBarStyle(state, darkTextColor, themeDefault)).toEqual(DARK_CONTENT_STYLE);
  });
});
