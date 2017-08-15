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
import getStatusBarColor from '../getStatusBarColor';
import themeLight from '../../styles/themeLight';
import themeDark from '../../styles/themeDark';

const themeNight = 'night';
const themeDefault = 'default';

describe('getStatusBarStyle', () => {
  test('return nav bar background color for stream, topic narrow', () => {
    expect(getStatusBarColor('#000', deepFreeze(streamNarrow('all')), themeNight)).toEqual('#000');
    expect(
      getStatusBarColor('#fff', deepFreeze(topicNarrow('all', 'announce')), themeDefault),
    ).toEqual('#fff');
  });

  test('return theme background color for home, private, group and special narrow', () => {
    expect(getStatusBarColor('#000', deepFreeze(homeNarrow()), themeNight)).toEqual(
      themeDark.backgroundColor,
    );
    expect(getStatusBarColor('#fff', deepFreeze(specialNarrow('private')), themeDefault)).toEqual(
      themeLight.backgroundColor,
    );

    expect(
      getStatusBarColor(
        '#000',
        deepFreeze(groupNarrow(['abc@zulip.com', 'xyz@zulip.com'])),
        themeNight,
      ),
    ).toEqual(themeDark.backgroundColor);

    expect(
      getStatusBarColor('#fff', deepFreeze(privateNarrow('abc@zulip.com')), themeDefault),
    ).toEqual(themeLight.backgroundColor);
  });

  test('return theme background color for other screens', () => {
    expect(getStatusBarColor('#fff', null, themeDefault)).toEqual(themeLight.backgroundColor);
    expect(getStatusBarColor('#fff', null, themeNight)).toEqual(themeDark.backgroundColor);
  });
});
