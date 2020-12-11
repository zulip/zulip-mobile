/* @flow strict-local */

import { DEFAULT_TITLE_BACKGROUND_COLOR, getTitleBackgroundColor } from '../titleSelectors';
import { pmNarrowFromEmails, streamNarrow, pmNarrowFromEmail } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('getTitleBackgroundColor', () => {
  const exampleColor = '#fff';
  const state = eg.reduxState({
    subscriptions: [{ ...eg.makeSubscription({ stream: eg.stream }), color: exampleColor }],
  });

  test('return default for screens other than chat, i.e narrow is undefined', () => {
    expect(getTitleBackgroundColor(state, undefined)).toEqual(DEFAULT_TITLE_BACKGROUND_COLOR);
  });

  test('return stream color for stream and topic narrow', () => {
    expect(getTitleBackgroundColor(state, streamNarrow(eg.stream.name))).toEqual(exampleColor);
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const unknownStream = eg.makeStream();
    expect(getTitleBackgroundColor(state, streamNarrow(unknownStream.name))).toEqual('gray');
  });

  test('return default for non topic/stream narrow', () => {
    expect(getTitleBackgroundColor(state, pmNarrowFromEmail(eg.otherUser.email))).toEqual(
      DEFAULT_TITLE_BACKGROUND_COLOR,
    );
    expect(
      getTitleBackgroundColor(state, pmNarrowFromEmails([eg.otherUser.email, eg.thirdUser.email])),
    ).toEqual(DEFAULT_TITLE_BACKGROUND_COLOR);
  });
});
