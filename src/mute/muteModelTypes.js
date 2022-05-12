// @flow strict-local
import Immutable from 'immutable';

import { type UserTopicVisibilityPolicy } from '../api/modelTypes';

/**
 * The "visibility policy" our user has chosen for each topic.
 *
 * See jsdoc of UserTopicVisibilityPolicy for background.
 *
 * In this data structure, the keys are stream ID and then topic name.
 * Values of `UserTopicVisibilityPolicy.None` are represented by absence,
 * and streams where the map would be empty are also omitted.
 */
// TODO(#5381): Ideally we'd call this UserTopicState and `state.userTopic`.
//   But it's currently a pain to actually rename a state subtree: #5381.
export type MuteState = Immutable.Map<
  number, // stream ID
  Immutable.Map<
    string, // topic name
    UserTopicVisibilityPolicy,
  >,
>;
