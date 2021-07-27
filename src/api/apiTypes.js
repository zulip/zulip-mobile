/* @flow strict-local */

/**
 * Temporary placeholder for the resolve type of a `fetch`.
 *
 * The `empty` is bogus, as we saw in 4ef0f061e. As mentioned there, it's
 * because React Native defeats type-checking on `fetch` calls. We expect
 * that'll be fixed in RN v0.65, with facebook/react-native@6651b7c59.
 */
export type FixmeUntypedFetchResult = empty;

export type * from './transportTypes';
export type * from './modelTypes';
export type * from './eventTypes';
export type * from './initialDataTypes';
