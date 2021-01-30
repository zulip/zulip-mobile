/* @flow strict-local */
import { useRef, useEffect } from 'react';

/**
 * A Hook for the value of a prop, state, etc., from the previous
 *   render, or the first render if this is the first.
 *
 * From
 * https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state,
 * which says, "It’s possible that in the future React will provide a
 * `usePrevious` Hook out of the box since it’s a relatively common
 * use case."
 */
export function usePrevious<T>(value: T): T {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
