/* @flow */
import deepFreeze from 'deep-freeze';

import { getTitleBackgroundColor, getTitleTextColor } from '../titleSelectors';
import {
  streamNarrow,
  topicNarrow,
  privateNarrow,
  specialNarrow,
  groupNarrow,
} from '../../utils/narrow';
import { foregroundColorFromBackground } from '../../utils/color';
import { BRAND_COLOR } from '../../styles';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getTitleBackgroundColor', () => {
  test('return stream color for stream and topic narrow', () => {
    let state = deepFreeze({ chat: { narrow: streamNarrow('all') }, subscriptions });
    expect(getTitleBackgroundColor(state)).toEqual('#fff');

    state = deepFreeze({ chat: { narrow: topicNarrow('announce', '@all') }, subscriptions });
    expect(getTitleBackgroundColor(state)).toEqual('#000');
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const state = deepFreeze({ chat: { narrow: streamNarrow('feedback') }, subscriptions });
    expect(getTitleBackgroundColor(state)).toEqual('gray');
  });

  test('return transparent for other narrow and screens', () => {
    let state = deepFreeze({ chat: { narrow: privateNarrow('a@a.com') }, subscriptions });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');

    state = deepFreeze({ chat: { narrow: groupNarrow(['a@a.com', 'b@b.com']) }, subscriptions });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');

    state = deepFreeze({ chat: { narrow: [] }, subscriptions });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');

    state = deepFreeze({ chat: { narrow: specialNarrow('private') }, subscriptions });
    expect(getTitleBackgroundColor(state)).toEqual('transparent');
  });
});

describe('getTitleTextColor', () => {
  test('for stream and topic narrow get use foregroundColorFromBackground', () => {
    let state = deepFreeze({ chat: { narrow: streamNarrow('all') }, subscriptions });
    expect(getTitleTextColor(state)).toEqual(foregroundColorFromBackground('#fff'));

    state = deepFreeze({ chat: { narrow: topicNarrow('announce', '@all') }, subscriptions });
    expect(getTitleTextColor(state)).toEqual(foregroundColorFromBackground('#000'));
  });

  test('for other narrow get BRAND_COLOR', () => {
    let state = deepFreeze({ chat: { narrow: privateNarrow('a@a.com') }, subscriptions });
    expect(getTitleTextColor(state)).toEqual(BRAND_COLOR);

    state = deepFreeze({ chat: { narrow: groupNarrow(['a@a.com', 'b@b.com']) }, subscriptions });
    expect(getTitleTextColor(state)).toEqual(BRAND_COLOR);

    state = deepFreeze({ chat: { narrow: specialNarrow('search') }, subscriptions });
    expect(getTitleTextColor(state)).toEqual(BRAND_COLOR);
  });
});
