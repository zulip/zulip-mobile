import deepFreeze from 'deep-freeze';

import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../titleSelectors';
import { groupNarrow, streamNarrow, privateNarrow } from '../../utils/narrow';

const subscriptions = [{ name: 'all', color: '#fff' }, { name: 'announce', color: '#000' }];

describe('getTitleBackgroundColor', () => {
  test('return default for screens other than chat, i.e narrow is undefined', () => {
    const state = deepFreeze({
      subscriptions,
    });

    expect(getTitleBackgroundColor(state, undefined)).toEqual(DEFAULT_TITLE_BACKGROUND_COLOR);
  });

  test('return stream color for stream and topic narrow', () => {
    const state = deepFreeze({
      subscriptions,
    });

    expect(getTitleBackgroundColor(state, streamNarrow('all'))).toEqual('#fff');
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const state = deepFreeze({
      subscriptions,
    });

    expect(getTitleBackgroundColor(state, streamNarrow('feedback'))).toEqual('gray');
  });

  test('return default for non topic/stream narrow', () => {
    const state = deepFreeze({
      subscriptions,
    });

    expect(getTitleBackgroundColor(state, privateNarrow('abc@zulip.com'))).toEqual(
      DEFAULT_TITLE_BACKGROUND_COLOR,
    );
    expect(getTitleBackgroundColor(state, groupNarrow(['abc@zulip.com', 'def@zulip.com']))).toEqual(
      DEFAULT_TITLE_BACKGROUND_COLOR,
    );
  });
});
