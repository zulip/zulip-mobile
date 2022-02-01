// @flow strict-local

// No need for Immutable, because -- the server API actually doesn't support
// incremental changes!  When something changes, it sends the entire new list.
export type MuteState = Map<number, Set<string>>; // stream ID, topic
