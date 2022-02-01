// @flow strict-local

import type { MutedTopicTuple } from '../api/apiTypes';

// TODO(#3918): Use stream IDs for muted topics, not stream names.
//   Server issue for fixing that in the API: https://github.com/zulip/zulip/issues/21015
//   Meanwhile, even while the server is still sending stream names,
//   we should convert to stream IDs at the edge.
export type MuteState = $ReadOnlyArray<MutedTopicTuple>;
