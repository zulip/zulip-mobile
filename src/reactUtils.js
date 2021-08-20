/* @flow strict-local */
import { useRef, useEffect } from 'react';

/**
 * A Hook for the value of a prop, state, etc., from the previous render.
 *
 * On first render, returns `initValue`.
 *
 * Adapted from
 * https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state,
 * which says, "It’s possible that in the future React will provide a
 * `usePrevious` Hook out of the box since it’s a relatively common
 * use case."
 */
export function usePrevious<T>(value: T, initValue: T | void): T | void {
  const ref = useRef<T | void>(initValue);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
