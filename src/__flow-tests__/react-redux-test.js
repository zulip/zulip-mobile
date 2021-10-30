// @flow strict-local
import type { ComponentType } from 'react';

import { typesEquivalent } from '../generics';
import type { OwnProps } from '../react-redux';

// A slight abbreviation to make some test cases more compact.
type OwnPropsOf<P, -SP, -D> = OwnProps<ComponentType<P>, SP, D>;

// prettier-ignore
function test_OwnProps() {
  type Dispatch = { asdf: number, qwer: boolean, ... };

  // Basic happy case.
  typesEquivalent<
    OwnPropsOf<{| +a: string, +b: number, +dispatch: Dispatch, |},
               {| +b: number |}, Dispatch>,
    {| +a: string |}>();
  (p: OwnPropsOf<{| +a: string, +b: number, +dispatch: Dispatch, |},
                 {| +b: number |}, Dispatch>): { ... } => p;

  // Component can have weaker expectations of a selector prop…
  typesEquivalent<
    OwnPropsOf<{| +a: string, +b: number, +dispatch: Dispatch, |},
               {| +b: 3 |}, Dispatch>,
    {| +a: string |}>();

  // … but not stronger…
  // $FlowExpectedError[incompatible-type-arg]
  (p: OwnPropsOf<{| +a: string, +b: 3, +dispatch: Dispatch, |},
                 {| +b: number |}, Dispatch>): { ... } => p;

  // … and must expect each selector prop in the first place.
  // $FlowExpectedError[prop-missing]
  (p: OwnPropsOf<{| +a: string, +dispatch: Dispatch, |},
                 {| +b: number |}, Dispatch>): { ... } => p;
}

// prettier-ignore
// Test handling of the `dispatch` prop.
function test_OwnProps_dispatch() {
  type Dispatch = { asdf: number, qwer: boolean, ... };

  // Basic happy case.
  typesEquivalent<
    OwnPropsOf<{| +dispatch: Dispatch |}, {||}, Dispatch>,
    {||}>();
  (p: OwnPropsOf<{| +dispatch: Dispatch |}, {||}, Dispatch>): { ... } => p;

  // Component can have weaker expectations…
  typesEquivalent<
    OwnPropsOf<{| +dispatch: mixed |}, {||}, Dispatch>,
    {||}>();

  // … but not stronger…
  // $FlowExpectedError[incompatible-type-arg]
  (p: OwnPropsOf<{| +dispatch: empty |}, {||}, Dispatch>): { ... } => p;

  // … and must expect the prop at all.
  // $FlowExpectedError[prop-missing]
  (p: OwnPropsOf<{||}, {||}, Dispatch>): { ... } => p;
}
