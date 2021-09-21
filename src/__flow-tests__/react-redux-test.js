// @flow strict-local
import type { ComponentType } from 'react';

import { typesEquivalent } from '../generics';
import type { Dispatch } from '../types';
import type { OwnProps } from '../react-redux';

// A slight abbreviation to make some test cases more compact.
type OwnPropsOf<P, -SP> = OwnProps<ComponentType<P>, SP>;

// prettier-ignore
function test_OwnProps() {
  // Basic happy case.
  typesEquivalent<
    OwnPropsOf<{| +a: string, +b: number, +dispatch: Dispatch, |},
               {| +b: number |}>,
    {| +a: string |}>();
  (p: OwnPropsOf<{| +a: string, +b: number, +dispatch: Dispatch, |},
                 {| +b: number |}>): { ... } => p;

  // Component can have weaker expectations of a selector prop…
  typesEquivalent<
    OwnPropsOf<{| +a: string, +b: number, +dispatch: Dispatch, |},
               {| +b: 3 |}>,
    {| +a: string |}>();

  // … but not stronger…
  // $FlowExpectedError[incompatible-type-arg]
  (p: OwnPropsOf<{| +a: string, +b: 3, +dispatch: Dispatch, |},
                 {| +b: number |}>): { ... } => p;

  // … and must expect each selector prop in the first place.
  // $FlowExpectedError[prop-missing]
  (p: OwnPropsOf<{| +a: string, +dispatch: Dispatch, |},
                 {| +b: number |}>): { ... } => p;
}

// prettier-ignore
// Test handling of the `dispatch` prop.
function test_OwnProps_dispatch() {
  // Basic happy case.
  typesEquivalent<
    OwnPropsOf<{| +dispatch: Dispatch |}, {||}>,
    {||}>();
  (p: OwnPropsOf<{| +dispatch: Dispatch |}, {||}>): { ... } => p;

  // Component can have weaker expectations…
  typesEquivalent<
    OwnPropsOf<{| +dispatch: mixed |}, {||}>,
    {||}>();

  // … but not stronger…
  // $FlowExpectedError[incompatible-type-arg]
  (p: OwnPropsOf<{| +dispatch: empty |}, {||}>): { ... } => p;

  // … and must expect the prop at all.
  // $FlowExpectedError[prop-missing]
  (p: OwnPropsOf<{||}, {||}>): { ... } => p;
}
