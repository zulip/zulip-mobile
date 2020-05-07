/* @flow strict-local */
import type { IsSupertype } from '../types';

/* eslint-disable flowtype/space-after-type-colon */

declare var magic: empty;

function test_IsSupertype() {
  // To get the expected errors, we'll need to force Flow to actually
  // instantiate the type and look inside.  (This is why `IsSupertype`
  // returns an interesting type in the first place, rather than some
  // constant like `empty` or `mixed`.)  We'll do that with a cast.

  // We'll need the type we cast from to also be a more interesting type than
  // `empty`, as a value of type `empty` causes Flow to just declare victory:
  (magic: IsSupertype<number, mixed>);
  // This is OK in practice because in real life there are no values of type
  // `empty`; if you have an expression of type `empty`, you're already
  // asserting falsehood.  (And it's perfectly OK from a theoretical
  // perspective for basically the same reason said differently: `empty` is
  // the type interpretation of logical falsity, and ex falso quodlibet.)

  // Test the basics, relative to a primitive type.
  (1: IsSupertype<number, empty>);
  (1: IsSupertype<number, number>);
  // $FlowExpectedError[incompatible-type-arg]
  (1: IsSupertype<number, mixed>);
  // $FlowExpectedError[incompatible-type-arg]
  (1: IsSupertype<number, string>);

  // Test the resulting type (as opposed to whether the type is instantiable
  // at all, which is the main point of `IsSupertype`.)
  (magic: IsSupertype<number, number>);
  // $FlowExpectedError[incompatible-cast]
  ((1: mixed): IsSupertype<number, number>);
  // $FlowExpectedError[incompatible-cast]
  ('': IsSupertype<number, number>);

  // `empty` isn't a supertype of anything but itself.  It's a bit hard to
  // test this fact directly, because of the above-mentioned issue that
  // casting a value of type `empty` causes Flow to just declare victory:
  (magic: IsSupertype<empty, number>);
  // but, again, in reality there are no values of type `empty` anyway.
  // If we try casting from another type, we get an error as you'd hope:
  // $FlowExpectedError[incompatible-cast]
  // $FlowExpectedError[incompatible-type-arg]
  (1: IsSupertype<empty, number>);
  // and in fact two of them-- one for the cast because nothing can be cast
  // to `empty`, and one for instantiating IsSupertype in the first place.
  // prettier-ignore
  ( // $FlowExpectedError[incompatible-cast]
    1:
    // $FlowExpectedError[incompatible-type-arg]
    IsSupertype<empty, number>);

  // Test on unions.
  (1: IsSupertype<number | void, number>);
  // $FlowExpectedError[incompatible-type-arg]
  (1: IsSupertype<number, number | void>);
}

function test_IsSupertype_object_types() {
  // A value to cast.
  const a: {| a: number |} = { a: 1 };
  // Check that the casts don't themselves cause errors,
  // so the errors we find below really do come from IsSupertype.
  (a: { a: number, ... });
  (a: {| a: number |});
  (a: {| +a: number |});

  // And a quick demo that IsSupertype is reflexive, i.e. T <: T for each T.
  (a: IsSupertype<{ a: number, ... }, { a: number, ... }>);
  (a: IsSupertype<{| a: number |}, {| a: number |}>);
  (a: IsSupertype<{| +a: number |}, {| +a: number |}>);

  // Exact <: inexact, strictly.
  (a: IsSupertype<{ a: number, ... }, {| a: number |}>);
  // $FlowExpectedError[incompatible-exact]
  (a: IsSupertype<{| a: number |}, { a: number, ... }>);

  // Read-only properties are covariant.
  (a: IsSupertype<{| +a: number |}, {| +a: empty |}>);
  // $FlowExpectedError[incompatible-type-arg]
  (a: IsSupertype<{| +a: number |}, {| +a: mixed |}>);

  // Read-write properties are invariant.
  // $FlowExpectedError[incompatible-type-arg]
  (a: IsSupertype<{| a: number |}, {| a: empty |}>);
  // $FlowExpectedError[incompatible-type-arg]
  (a: IsSupertype<{| a: number |}, {| a: mixed |}>);

  // Read-write <: read-only, strictly.
  (a: IsSupertype<{| +a: number |}, {| a: number |}>);
  // $FlowExpectedError[incompatible-variance]
  (a: IsSupertype<{| a: number |}, {| +a: number |}>);

  // Another value to cast.
  const ab: {| a: number, b: number |} = { a: 1, b: 2 };
  (ab: { a: number, b: number, ... });
  (ab: {| a: number, b: number |});

  // Extra properties; exact and inexact doing their jobs.
  (a: IsSupertype<{ a: number, ... }, { a: number, b: number, ... }>);
  (a: IsSupertype<{ a: number, ... }, {| a: number, b: number |}>);
  // $FlowExpectedError[prop-missing]
  (ab: IsSupertype<{ a: number, b: number, ... }, { a: number, ... }>);
  // $FlowExpectedError[prop-missing]
  // $FlowExpectedError[incompatible-exact]
  (ab: IsSupertype<{| a: number, b: number |}, { a: number, ... }>);
  // $FlowExpectedError[prop-missing]
  // $FlowExpectedError[incompatible-exact]
  (a: IsSupertype<{| a: number |}, { a: number, b: number, ... }>);
  // $FlowExpectedError[prop-missing]
  (a: IsSupertype<{| a: number |}, {| a: number, b: number |}>);
}
