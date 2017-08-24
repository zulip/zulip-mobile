/* @flow */
import deepFreeze from 'deep-freeze';

import {
  streamNarrow,
  topicNarrow,
  privateNarrow,
  homeNarrow,
  specialNarrow,
  groupNarrow,
} from '../narrow';
import getStatusBarStyle from '../getStatusBarStyle';

const themeNight = 'night';
const themeDefault = 'default';

const darkTextColor = 'black';
const lightTextColor = 'white';

const LIGHT_CONTENT_STYLE = 'light-content';
const DARK_CONTENT_STYLE = 'dark-content';

describe('getStatusBarStyle', () => {
  test('return bar style according to theme for screens other than main', () => {
    expect(getStatusBarStyle(null, darkTextColor, themeDefault)).toEqual(DARK_CONTENT_STYLE);
  });

  test('return bar style according to text color for stream and topic narrow in main screen', () => {
    expect(getStatusBarStyle(deepFreeze(streamNarrow('all')), darkTextColor, themeDefault)).toEqual(
      DARK_CONTENT_STYLE,
    );

    expect(
      getStatusBarStyle(deepFreeze(topicNarrow('all', 'announce')), lightTextColor, themeDefault),
    ).toEqual(LIGHT_CONTENT_STYLE);
  });

  test('returns style according to theme for private, group, home and special narrow', () => {
    expect(
      getStatusBarStyle(deepFreeze(privateNarrow('abc@zulip.com')), darkTextColor, themeDefault),
    ).toEqual(DARK_CONTENT_STYLE);

    expect(
      getStatusBarStyle(deepFreeze(privateNarrow('abc@zulip.com')), lightTextColor, themeNight),
    ).toEqual(LIGHT_CONTENT_STYLE);

    expect(getStatusBarStyle(deepFreeze(homeNarrow()), darkTextColor, themeDefault)).toEqual(
      DARK_CONTENT_STYLE,
    );

    expect(
      getStatusBarStyle(
        deepFreeze(groupNarrow(['abc@zulip.com', 'def@zulip.com'])),
        darkTextColor,
        themeDefault,
      ),
    ).toEqual(DARK_CONTENT_STYLE);

    expect(
      getStatusBarStyle(deepFreeze(specialNarrow('private')), darkTextColor, themeDefault),
    ).toEqual(DARK_CONTENT_STYLE);
  });
});
