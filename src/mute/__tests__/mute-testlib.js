/* @flow strict-local */

import { reducer } from '../muteModel';
import type { MuteState } from '../muteModelTypes';
import type { Stream } from '../../api/modelTypes';
import { EVENT_MUTED_TOPICS } from '../../actionConstants';

export const makeMuteState = (data: $ReadOnlyArray<[Stream, string]>): MuteState =>
  reducer(undefined, {
    type: EVENT_MUTED_TOPICS,
    id: -1,
    muted_topics: data.map(([stream, topic]) => [stream.name, topic]),
  });
