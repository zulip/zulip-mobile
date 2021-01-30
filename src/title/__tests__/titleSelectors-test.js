/* @flow strict-local */

import { getStreamColorForNarrow } from '../titleSelectors';
import { pmNarrowFromUsersUnsafe, streamNarrow, pm1to1NarrowFromUser } from '../../utils/narrow';
import * as eg from '../../__tests__/lib/exampleData';

describe('getStreamColorForNarrow', () => {
  const exampleColor = '#fff';
  const state = eg.reduxState({
    subscriptions: [{ ...eg.makeSubscription({ stream: eg.stream }), color: exampleColor }],
  });

  test('return stream color for stream and topic narrow', () => {
    expect(getStreamColorForNarrow(state, streamNarrow(eg.stream.name))).toEqual(exampleColor);
  });

  test('return null stream color for invalid stream or unknown subscriptions', () => {
    const unknownStream = eg.makeStream();
    expect(getStreamColorForNarrow(state, streamNarrow(unknownStream.name))).toEqual('gray');
  });

  test('return undefined for non topic/stream narrow', () => {
    expect(getStreamColorForNarrow(state, pm1to1NarrowFromUser(eg.otherUser))).toEqual(undefined);
    expect(
      getStreamColorForNarrow(state, pmNarrowFromUsersUnsafe([eg.otherUser, eg.thirdUser])),
    ).toEqual(undefined);
  });
});
