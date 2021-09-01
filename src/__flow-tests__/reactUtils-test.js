/* @flow strict-local */
import { usePrevious } from '../reactUtils';

function test_usePrevious() {
  declare var b: boolean;

  // With no initial value, returns T | void:
  {
    (usePrevious(b): boolean | void);

    // In particular, make sure the type knows the return value can be void.
    // (This is the case that would break with one natural-but-wrong way to
    // write the definition.)
    // $FlowExpectedError[incompatible-cast]
    (usePrevious(b): boolean);

    // $FlowExpectedError[incompatible-cast]
    (usePrevious(b): void);
  }

  // With initial value, returns union type:
  {
    (usePrevious(b, null): boolean | null);
    // $FlowExpectedError[incompatible-cast]
    (usePrevious(b, null): boolean);
    // $FlowExpectedError[incompatible-cast]
    (usePrevious(b, null): null);
  }

  // With initial value of type T, returns T:
  {
    (usePrevious(b, false): boolean);
    // $FlowExpectedError[incompatible-cast]
    (usePrevious(b, false): false);
  }
}
