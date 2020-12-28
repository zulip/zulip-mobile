/* @flow strict-local */
import type { Action } from '../types';

// Assert that Action does not allow arbitrary objects.
{
  const foo = { nonexistent_key: 'bar' };
  // $FlowExpectedError
  const bar: Action = foo;
}
