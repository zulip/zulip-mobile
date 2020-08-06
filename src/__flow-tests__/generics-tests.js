/* @flow strict-local */
import { typesEquivalent } from '../generics';
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

function test_typesEquivalent() {
  // $ReadOnly means the same thing as putting a `+` variance sigil
  // on each property, so these are two ways of spelling the same thing.
  typesEquivalent<$ReadOnly<{| x: number |}>, {| +x: number |}>();

  // $FlowExpectedError[incompatible-call] - These are different types :-)
  typesEquivalent<number, number | void>();

  // prettier-ignore
  // Demonstrate the use of `$Diff`.
  typesEquivalent<$Diff<{| x: number, y: number |}, {| y: mixed |}>,
                  {| x: number |}>();
}

// prettier-ignore
function test_typesEquivalent_$Diff_surprise() {
  // These two types are "equivalent" in that a value of either type can be
  // used where the other type is expected.
  typesEquivalent<{| x?: mixed |}, {| x: mixed |}>();

  // But they are *not* always interchangeable when passed to a type-level
  // operation (what Flow docs call a "type destructor"), like `$Diff`.
  type S = {| x: number |};
  typesEquivalent<$Diff<S, {| x?: mixed |}>, // $FlowExpectedError[prop-missing]
                  $Diff<S, {| x: mixed |}>>();

  // Instead, subtracting `x?: mixed` just makes the property optional:
  typesEquivalent<$Diff<S, {| x?: mixed |}>, {| x?: number |}>();
  // while subtracting `x: mixed` actually removes it:
  typesEquivalent<$Diff<S, {| x: mixed |}>, {||}>();

  {
    // Aside: The fact that these are equivalent in the first place is
    // arguably an unsoundness bug in Flow: it means we can end up treating
    // a value `{}` as being of type `{| x: mixed |}`, even though the
    // latter on its face should always require a property `x`.

    // And indeed we can't give such a value that type directly:
    // $FlowExpectedError[incompatible-exact]
    const a1: {| x: mixed |} = {};
    // $FlowExpectedError[incompatible-exact]
    // $FlowExpectedError[prop-missing]
    const a2: {| x: mixed |} = ({}: {||});
    // $FlowExpectedError[prop-missing]
    const a3: {| x: mixed |} = Object.freeze({});

    // But we can if we launder it through `{| x?: mixed |}`:
    const b1: {| x?: mixed |} = Object.freeze({});
    const b2: {| x: mixed |} = b1;

    // This is mostly OK in practice because if we actually try to read the
    // `x` property on one of these values, we get `undefined` -- which is a
    // perfectly good value of type `mixed`, so we had to be prepared to
    // handle it in any case.

    {
      // BTW the `Object.freeze` is just to avoid an unrelated Flow quirk
      // related to "unsealed" object types:
      //   https://github.com/facebook/flow/issues/2386#issuecomment-695064325
      // We can get the same result by including any other properties at all
      // in the type, which makes the example a bit longer but probably more
      // realistic anyway.

      // Here's the error again on trying to apply that type directly:
      // $FlowExpectedError[prop-missing]
      const c1: {| x: mixed, y: mixed |} = { y: 3 };
      // $FlowExpectedError[prop-missing]
      const c2: {| x: mixed, y: mixed |} = ({ y: 3 }: {| y: mixed |});

      // And here we are again laundering it through an optional `x`:
      const d1: {| x?: mixed, y: mixed |} = { y: 3 };
      const d2: {| x: mixed, y: mixed |} = d1;
    }
  }
}
