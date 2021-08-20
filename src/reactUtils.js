/* @flow strict-local */
import { useRef, useEffect } from 'react';

/**
 * A Hook for the value of a prop, state, etc., from the previous render.
 *
 * On first render, returns `initValue`.
 *
 * The second argument `initValue` is optional (even though the type doesn't
 * at first look that way): if omitted, it's `undefined` and the return type
 * is `T | void`.
 *
 * Adapted from
 * https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state,
 * which says, "It’s possible that in the future React will provide a
 * `usePrevious` Hook out of the box since it’s a relatively common
 * use case."
 */
// It's `initValue:`, not `initValue?:`, but initValue is still effectively
// optional because `U` can be void.
//
// If we did write `initValue?:`, we'd get the wrong return type when the
// caller omitted it: there'd be nothing to force `U` to include void
// (because effectively the `?` would handle it instead), and so `U` would
// be the empty type and `T | U` would be just `T`.
export function usePrevious<T, U>(value: T, initValue: U): T | U {
  const ref = useRef<T | U>(initValue);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
