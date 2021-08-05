/* @flow strict-local */
import type Immutable from 'immutable';

import type { HuddlesUnreadItem, PmsUnreadItem } from '../api/apiTypes';

/**
 * A summary of (almost) all unread stream messages.
 *
 * This is a map from stream IDs, to maps from topics, to lists of
 * message IDs.  Each list is sorted.  So e.g. for the number of unreads
 * in a given topic, say `.get(streamId).get(topic).size`.
 *
 * NB this includes messages to muted streams and topics.
 *
 * Part of `UnreadState`; see there for more.
 */
// prettier-ignore
export type UnreadStreamsState =
  Immutable.Map<number, Immutable.Map<string, Immutable.List<number>>>;

/**
 * A summary of (almost) all unread group PMs.
 *
 * ("Huddle" is the server's internal term for a group PM conversation.)
 *
 * The format is borrowed straight from the initial version of this data the
 * server gives us at `/register` time, and is a bit quirky.  See the
 * definition of `HuddlesUnreadItem` in `src/api/initialDataTypes.js`.
 *
 * Part of `UnreadState`; see there for more.
 */
export type UnreadHuddlesState = $ReadOnlyArray<HuddlesUnreadItem>;

/**
 * A summary of (almost) all unread 1:1 PMs.
 *
 * The format is borrowed straight from the initial version of this data the
 * server gives us at `/register` time, and is a bit quirky.  See the
 * definition of `PmsUnreadItem` in `src/api/initialDataTypes.js`.
 *
 * Part of `UnreadState`; see there for more.
 * See in particular `UnreadHuddlesState` for group PMs.
 */
export type UnreadPmsState = $ReadOnlyArray<PmsUnreadItem>;

/**
 * A summary of (almost) all unread messages with @-mentions.
 *
 * This is a list of message IDs.  It is not necessarily sorted.
 *
 * NB that each of these messages is necessarily also either a stream
 * message, a group PM, or a 1:1 PM, so it will also be found in one of the
 * other parts of `UnreadState`.
 *
 * Part of `UnreadState`; see there for more.
 */
export type UnreadMentionsState = $ReadOnlyArray<number>;

/**
 * A summary of (almost) all unread messages, even those we don't have.
 *
 * For the meaning of "(almost) all", see discussion at `unread_msgs` in
 * `src/api/initialDataTypes.js`, describing the server feature that gives
 * us the initial version of this data at `/register` time.
 *
 * Starting from that initial version, we keep this data structure up to
 * date as new messages arrive, as messages are marked as read, etc.
 */
export type UnreadState = $ReadOnly<{|
  streams: UnreadStreamsState,
  huddles: UnreadHuddlesState,
  pms: UnreadPmsState,
  mentions: UnreadMentionsState,
|}>;
