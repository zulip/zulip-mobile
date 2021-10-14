/* @flow strict-local */
import { type BoundedDiff, typesEquivalent } from '../generics';
import type { IsSupertype } from '../types';

/* eslint-disable flowtype/space-after-type-colon */

/** General tip on writing tests for fancy generic types like these. */
// prettier-ignore
function demo_need_value_flow() {
  // A basic principle of how Flow works is that it's focused on tracking
  // the, well, *flow* (the name is not a coincidence) of values from one
  // place in the program (a variable, a function parameter, an object
  // property, an expression, etc.) to another.
  //
  // Type-level expressions are secondary to this.  Their implications often
  // only get worked through lazily, when some value-level flow makes it
  // necessary to do so.
  //
  // That means if you're testing some type-level operator like IsSupertype
  // or BoundedDiff, you'll typically need to create some value-level flows
  // to exercise it -- even for cases where the intent is that some choices
  // of type parameter result in an error of their own.

  // Here's a toy example of a generic type with an internal constraint:
  type IsString<S: string> = string;

  // IsString<T> should be an error for any T that isn't <: string.
  // And indeed it is, in a variety of contexts:

  //   $FlowExpectedError[incompatible-type-arg]
  function f1<T>(x: T): IsString<T> { return 'b'; }
  // while compare:
  function f2<T: string>(x: T): IsString<'a'> { return 'b'; }
  function f3<T: string>(x: T): IsString<'a'> { return x; }

  //   $FlowExpectedError[incompatible-type-arg]
  (x: string): IsString<number> => x;
  //   $FlowExpectedError[incompatible-type-arg]
  (x: string): IsString<mixed> => x;
  // while compare:
  (x: string): IsString<string> => x;
  (x: string): IsString<'a'> => x;
  (x: string): IsString<empty> => x;

  //   $FlowExpectedError[incompatible-type-arg]
  (x: IsString<mixed>): string => x;
  // while compare:
  (x: IsString<string>): string => x;

  //   $FlowExpectedError[incompatible-type-arg]
  ('b': IsString<mixed>);
  // while compare:
  ('b': IsString<string>);

  //
  //
  // However.  One thing those all have in common is that the offending
  // instantiation `IsString<…>` appears as either the source or the
  // destination of some value-level flow.

  // For example, this return type had a returned value flowing into it:
  //   $FlowExpectedError[incompatible-type-arg]
  (x: string): IsString<number> => x;

  // If we have the same bogus `IsString<…>` type as a return type, but
  // avoid ever returning a value that has to flow to that return type,
  // then there's no error:
  (x: string): IsString<number> => { throw new Error(); };

  // In the other direction, this parameter with a bogus type was the source
  // of a flow into the return value:
  //   $FlowExpectedError[incompatible-type-arg]
  (x: IsString<mixed>): string => x;
  // We could flow it into somewhere else instead, and still get the error:
  //   $FlowExpectedError[incompatible-type-arg]
  (x: IsString<mixed>): string => { (x: string); return 'b'; };
  // But if it flows nowhere at all, there's no error:
  (x: IsString<mixed>): string => { x; return 'b'; };
  (x: IsString<mixed>): string => 'b';

  // Similarly if we just mention the bogus type in another way but with no
  // value-level flows to or from it, there's no error:
  declare var x: IsString<number>;

  //
  //
  // Happily this point isn't really a warning -- there's no need to worry
  // about getting anything wrong by forgetting it.  As long as you set out
  // to write tests for the error case, if you forget this point then you'll
  // see that your tests are failing to fail.
  //
  // Rather, this is a tip for how to solve that problem if you run into it:
  // cause some value to flow to or from the bogus type, and then Flow
  // should notice that the type is bogus.
}

/** A subtler tip on writing tests for fancy generic types like these. */
function demo_short_circuits() {
  // As seen above, in order to test one of these types you need to exercise
  // it with some value-level flow to or from it.
  //
  // A further wrinkle is that if your value-level flow is necessarily OK
  // thanks to some general rule of the type system, some reasoning that
  // doesn't depend on the details of the bogus type (that you're trying to
  // test is indeed seen as bogus)… then Flow may apply that rule and
  // short-circuit any closer inspection of the specific types on each side.
  //
  // In particular (and we'll demo each of these below):
  //  * If the flow is from `empty`, it succeeds.  (Even if the other end is
  //    an internally-bogus type.)
  //  * If the flow is to `mixed`, it succeeds.  (Ditto.)
  //  * If the flow is from some type to itself, it succeeds (even if that
  //    type is internally bogus.)
  //
  // (The jargon for these facts is: `empty` is a "bottom" type; `mixed` is
  // a "top" type; and the subtype relation (the ability to flow from one
  // type to another) is "reflexive".)
  //
  // It seems bad that Flow can accept a program, with no errors, when it
  // contains a type somewhere that's bogus like `IsString<number>`.
  // Ideally Flow would reject those, because it's confusing.  (One likely
  // reason it accepts them is for performance: each of these situations is
  // quick to check for, and then Flow gets to check off that flow as valid
  // and move on.)
  //
  // But from Flow's perspective this is a fundamentally sound thing to do,
  // because it can't enable something actually going wrong in the program
  // at runtime.  That is, if some place in the program (some expression,
  // variable, object property, etc.) gets a bogus type, and if at runtime
  // that place actually gets reached so that there's some actual value that
  // supposedly has that bogus type, then (modulo some other issue in Flow)
  // it must be because of a type error somewhere in the program.
  //
  // In particular, if one of the rules above prevents an error we would
  // have otherwise gotten about a bogus type, and a value ever actually
  // reaches that bogus type at runtime, then there must be an error
  // somewhere else too:
  //  * The `empty` type, as the name suggests, has no values.  So if
  //    something with a bogus type gets a value at runtime through a flow
  //    from `empty`, then there must have been a type error along the way
  //    to get the value into the `empty`-typed spot in the first place.
  //  * A flow from a bogus type to `mixed` leads only from, not to, a bogus
  //    type.
  //  * If some point A with a bogus type T gets a value at runtime through
  //    a flow from some other point B with the same bogus type T, then the
  //    value must have already before then gotten into point B, with its
  //    bogus type T.
  //
  // For the `empty` case in particular, here's a more theoretical way of
  // putting it that may be helpful.  The type `empty` is the type
  // interpretation of logical falsity: if you have an expression of type
  // `empty`, then reaching that expression at runtime means asserting
  // falsehood.  And "ex falso quodlibet": from falsehood, anything follows.

  //
  //
  // Here's the same toy example from before.
  type IsString<S: string> = string;
  // IsString<T> should be an error for any T that isn't <: string.

  // Here we flow something into a bogus IsString<T>, and get an error:
  //   $FlowExpectedError[incompatible-type-arg]
  (x: string): IsString<number> => x;
  // But if the source of the flow is `empty`, there's no error:
  (x: empty): IsString<number> => x;

  // Similarly, a flow somewhere from a bogus IsString<T> is an error:
  //   $FlowExpectedError[incompatible-type-arg]
  (x: IsString<number>): string => x;
  // but not if that somewhere is `mixed`:
  (x: IsString<number>): mixed => x;

  // Nor is flowing from the bogus type to itself an error:
  (x: IsString<number>): IsString<number> => x;

  // So if we want to test that `IsString<number>` is bogus as expected,
  // the solution is to flow from some type that isn't itself or `empty`:
  //   $FlowExpectedError[incompatible-type-arg]
  (x: string): IsString<number> => x;
  // or to flow to some type that isn't itself or `mixed`:
  //   $FlowExpectedError[incompatible-type-arg]
  (x: IsString<number>): string => x;

  //
  //
  // But what if the type already is no higher than `empty`?
  type IsString2<S: string> = empty;
  // If we flow from a type that isn't `empty`, the flow itself will be an
  // error.

  // Well, as one solution, we can flow *from* it instead:
  //   $FlowExpectedError[incompatible-type-arg]
  (x: IsString2<number>): string => x;

  // Alternatively, we can still flow to it from some non-empty type:
  //   $FlowExpectedError[incompatible-type-arg]
  //   $FlowExpectedError[incompatible-return]
  (x: string): IsString2<number> => x;
  // It'll come with an additional suppression for the flow itself.
  // But that one will have an error code like `incompatible-return` or
  // `incompatible-cast`.  The error in the type arguments passed to the
  // generic will have the distinctive error code `incompatible-type-arg`.
  // So the FlowExpectedError with that code checks for the error we're
  // trying to test for.

  //
  //
  // Happily, like the previous demo, this is not really a warning -- you
  // don't need to worry about it in advance, because if you run into it
  // you'll be alerted by your tests failing to find the expected errors.
  //
  // If you do, avoid flowing from `empty` or to `mixed` (or from the type
  // to itself.)  Instead, find a less extreme type to use for the other end
  // of the flow.
}

function test_IsSupertype() {
  // Test the basics, relative to a primitive type.
  // `number` is a supertype of `empty` and itself…
  (1: IsSupertype<number, empty>);
  (1: IsSupertype<number, number>);
  // … but not `mixed` or `string`.
  // $FlowExpectedError[incompatible-type-arg]
  (1: IsSupertype<number, mixed>);
  // $FlowExpectedError[incompatible-type-arg]
  (1: IsSupertype<number, string>);

  // Test the resulting type (as opposed to whether the type is instantiable
  // at all, which is the main point of `IsSupertype`.)
  (x: IsSupertype<number, number>): number => x;
  (x: number): IsSupertype<number, number> => x;
  (x: IsSupertype<number, 3>): number => x;
  (x: number): IsSupertype<number, 3> => x;

  // `empty` isn't a supertype of anything but itself.
  // $FlowExpectedError[incompatible-type-arg]
  (x: IsSupertype<empty, number>): number => x;

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

  // Same variance tests, this time with abstract types B <: A.
  function variance_again<A, B: A>() {
    // Now we have types B and A, which we know nothing about except that
    // B is a subtype of A.  Quick demo of that setup:
    (x: B): A => x;
    // $FlowExpectedError[incompatible-return]
    (x: A): B => x;

    // Read-only properties are covariant, again.
    (x: IsSupertype<{| +a: A |}, {| +a: B |}>): { ... } => x;
    // $FlowExpectedError[incompatible-type-arg]
    (x: IsSupertype<{| +a: B |}, {| +a: A |}>): { ... } => x;

    // Read-write properties are invariant, again.
    // $FlowExpectedError[incompatible-type-arg]
    (x: IsSupertype<{| a: A |}, {| a: B |}>): { ... } => x;
    // $FlowExpectedError[incompatible-type-arg]
    (x: IsSupertype<{| a: B |}, {| a: A |}>): { ... } => x;
  }

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

// prettier-ignore
function test_BoundedDiff() {
  // Here we use functions, to avoid having to ever actually make a value of
  // the various types.

  // Basic happy use.
  typesEquivalent<BoundedDiff<{| +a: string, +b: number |}, {| +b: number |}>,
                  {| +a: string |}>();

  // Basic happy use, checking only that the type is valid at all (and is
  // some object type).  This gives a baseline for some test cases below,
  // where we expect an error from BoundedDiff itself.
  (x: BoundedDiff<{| +a: string, +b: number |}, {| +b: number |}>): { ... } => x;

  // No extraneous properties allowed.
  // $FlowExpectedError[prop-missing]
  (x: BoundedDiff<{| +a: string, +b: number |}, {| +c: number |}>): { ... } => x;

  // For a given property, must be subtracting with (non-strict) subtype.
  (x: BoundedDiff<{| +a: string, +b: number |}, {| +b: 3 |}>): { ... } => x;
  (x: BoundedDiff<{| +a: string, +b: 3 |}, {| +b: 3 |}>): { ... } => x;
  // $FlowExpectedError[incompatible-type-arg]
  (x: BoundedDiff<{| +a: string, +b: 3 |}, {| +b: number |}>): { ... } => x;

  // Property is removed even if subtracting with a proper subtype.
  typesEquivalent<BoundedDiff<{| +a: string, +b: number |}, {| +b: 3 |}>,
                  {| +a: string |}>();
  typesEquivalent<BoundedDiff<{| +a: string, +b: mixed |}, {| +b: empty |}>,
                  {| +a: string |}>();
}
