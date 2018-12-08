import deepFreeze from 'deep-freeze';

import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../titleSelectors';
import { groupNarrow, streamNarrow, privateNarrow } from '../../utils/narrow';
import { defaultNav, otherNav } from '../../utils/testHelpers';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getTitleBackgroundColor', () => {
  test('return default for screens other than chat, i.e narrow is undefined', () => {
    const state = deepFreeze({
      nav: otherNav,
      subscriptions,
    });

    expect(getTitleBackgroundColor(undefined)(state)).toEqual(DEFAULT_TITLE_BACKGROUND_COLOR);
  });

  test('return stream color for stream and topic narrow', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });

    expect(getTitleBackgroundColor(streamNarrow('all'))(state)).toEqual('#fff');
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });

    expect(getTitleBackgroundColor(streamNarrow('feedback'))(state)).toEqual('gray');
  });

  test('return default for non topic/stream narrow', () => {
    const state = deepFreeze({
      nav: defaultNav,
      subscriptions,
    });

    expect(getTitleBackgroundColor(privateNarrow('abc@zulip.com'))(state)).toEqual(
      DEFAULT_TITLE_BACKGROUND_COLOR,
    );
    expect(getTitleBackgroundColor(groupNarrow(['abc@zulip.com', 'def@zulip.com']))(state)).toEqual(
      DEFAULT_TITLE_BACKGROUND_COLOR,
    );
  });
});
