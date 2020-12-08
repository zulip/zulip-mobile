/**
 * A dead-drop for select data to be included in log events.
 *
 * More precisely, for a getter for that data; this way we don't have to be
 * constantly updating it, as we would if this module contained a copy of
 * the data itself.
 *
 * This arrangement provides a way for the logging code to get this
 * information without having to import the Redux store.  Otherwise we tend
 * to get nasty import cycles, because logging is naturally low in the
 * import graph (imported by lots of other modules) and the app's Redux
 * store is naturally high in the import graph (importing lots of other
 * modules).
 *
 * @flow strict-local
 */
import type { ZulipVersion } from '../utils/zulipVersion';

type LoggingContext = {|
  serverVersion: ZulipVersion | null,
|};

let getter: (() => LoggingContext) | null = null;

/**
 * The logging context, or null if none is available.
 *
 * The null case should only happen if we haven't even finished importing
 * our code yet, in particular the code that provides the Redux store.
 */
export const getLoggingContext = (): LoggingContext | null => getter && getter();

/**
 * Set the getter for the logging context.
 *
 * This is called once at startup, after the Redux store is created.
 */
// Effectively the getter will contain:
//  * a reference to the Redux store, to get the state;
//  * references to some selectors, to pick the relevant data out of the
//    Redux state.
// We don't want the logging code to have to know about either of those,
// lest we create import cycles.  So the getter's implementation lives
// completely elsewhere and gets injected here.
export const provideLoggingContext = (newGetter: () => LoggingContext) => {
  getter = newGetter;
};
