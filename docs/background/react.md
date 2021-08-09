# React

## Core React types: Node, Element, Component, …

Here's a taxonomy of the core types in React, and how they're
reflected in Flow.

One informative source for this is the `react.js` libdef built into
Flow; you can find it locally in `/tmp/flow/flowlib_*/react.js` when
running Flow, or in the Flow source ([current][libdef-current];
[permalink][libdef-permalink]).  Some very helpful background is in a
2015 React blog post about [components, elements, and
instances][upstream-elements].

[libdef-current]: https://github.com/facebook/flow/blob/main/lib/react.js
[libdef-permalink]: https://github.com/facebook/flow/blob/v0.128.0/lib/react.js
[upstream-elements]: https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html

This page supplements those sources, because:
 * Not all of the types seen in Flow are documented; in particular
   those that are used in `react.js` but not defined there (because
   they're defined by special logic built into the type-checker.)
 * The naming isn't entirely consistent, which can be confusing.
 * The blog post's terminology doesn't correspond to the types in the
   code.


### Node

A React *node*, type `React$Node`, is what `render` methods/functions
return. This can be null or false, or an iterable of nodes, or a few
other things... or a React element.  From `react.js`:
```js
declare type React$Node =
  | null
  | boolean
  | number
  | string
  | React$Element<any>
  | React$Portal
  | Iterable<?React$Node>;
```


### Element

A React *element*, type `React$Element`, is the interesting kind of
node, the main thing `render` methods/functions return. It's also the
thing that JSX syntax produces. We don't usually see this directly,
but it's a little JS object; from `react.js`:

```js
/**
 * Type of a React element. React elements are commonly created using JSX
 * literals, which desugar to React.createElement calls (see below).
 */
declare type React$Element<+ElementType: React$ElementType> = {|
  +type: ElementType,
  +props: React$ElementProps<ElementType>,
  +key: React$Key | null,
  +ref: any,
|};
```
So a React element is a sort of spec for a React component instance.

For examples and more discussion, see especially [that upstream blog
post][upstream-elements].


### Element type / `ElementType`

A React *element type*, type `React$ElementType`, is a value that can
be used as the `type` property of a React element.

That is, a React element type is a value. Typically it's either a
class or a function.  It can also be some special values, like a return
value of `React.forwardRef` or `React.memo`.

* Those special values aren't contemplated in that 2015 blog post;
  probably they didn't yet exist then, and were introduced with the
  advent of Hooks.

Then the type `React$AbstractComponent` is a near-synonym.  Here's
from `react.js`:

```js
declare type React$ElementType =
  | string
  | React$AbstractComponent<empty, mixed>;
```

The `string` case is common in React DOM, but doesn't appear in RN.
So the relevant difference between the types is just that
`React$AbstractComponent` takes some type parameters that can make
things more precise.  More on `AbstractComponent` in its own section
below.

Another near-synonym is `React$ComponentType`.  From `react.js`:

```js
declare type React$ComponentType<-Config> = React$AbstractComponent<Config, mixed>;
```

So that's just the same as `React$AbstractComponent`, with the second
type parameter unavailable.  More on `ComponentType` in its own
section below.


### Component type / `ComponentType`

A React *component type* is therefore the same as an element type,
except that I guess if your React renderer accepts strings as element
types (as React DOM does) then maybe you'd take "component type" to
exclude those.

* This is consistent with the terminology in that blog post, where
  "DOM elements" (elements with a string `type`) are contrasted with
  "component elements" (elements with a non-string `type`.)

A "function component-type" is a function you might use as a React
element type.  It takes some props object, and returns a React node.

A "class component-type" is a class you might use as a React element
type.  It should inherit from `React.Component`.

See also the ambiguous term "component", in its own section below.


### Component instance / "instance" / `Component`

When an element's type is a class (a class component-type), React
creates an instance of that class to reflect the element.

In the code's terms, this instance is a `Component`, even though
upstream's prose discussions sometimes try to reserve "component" to
mean a component-type.  See discussion in the "component" section
below.


### "Component"

The term "component" alone ambiguously means either a component-type
or a component instance.  The shorter term is very convenient and
often used, but when talking about these subtle bits of the React API
-- like in this doc -- we try to stick to the longer, disambiguating
terms.

Similarly "function component" means the same as "function
component-type", and "class component" the same as "class
component-type".

Generally, upstream prose sources (like that 2015 blog post) say
"component" for component-type, and when being careful they say
"component instance" for an instance.  But on the other hand, the
React API gives the name `Component` to the base class that class
component-types inherit from… which means that each component instance
is an instance of `React.Component`.  By any normal convention of
class naming, that would have to mean that the instance "is a React
component".

And indeed, when talking about React it's common to say "component" to
mean a component instance.  This happens a couple of times even in
that blog post (e.g., at "an element describing a component"), which
is generally careful about these distinctions.


### `AbstractComponent`

A "React *abstract component*" is... not really a term, I think.
AFAICT "abstract" here is pointing in the direction of a React element
vs. a React component instance -- i.e., the spec for a component
instance vs. the actual component instance -- and also in the
direction of the element *type* vs. the actual element, i.e. leaving
out the specific prop values that make a particular element.

IOW, it's another way of saying "component type" or (for RN and other
renderers with no string element-types) "element type".

But those two type parameters are quite meaningful.  Here they are
with the names they're given elsewhere in `react.js`:
`React$AbstractComponent<-Config, +Instance>`


#### Config type

The *config type* of a React element type (that `Config` type
parameter) is the type it expects for the `props` property in a React
element that uses this type.

In a function-components world, this is effectively synonymous with
the type usually called `Props` -- it's the type of the function's
argument.  So you can mentally translate `Config` to `Props` just
about whenever you see it.

* (Where the distinction does something is in the case of a class
  component-type, and specifically a class that has a `defaultProps`,
  because that's what makes the `props` seen inside the component
  implementation different from the `props` in the element.  For
  example, if the class's props type has `foo: number`, and it has
  `foo: 0` in its `defaultProps`, then the config type will have
  `foo?: number`, because the element's `props` property can leave
  `foo` out.)


#### Instance type

The *instance type*, I guess one could call it, of a React element
type (that `Instance` type parameter), is… I think the type that gets
provided to a ref you pass as `ref` on an element with that type? Not
entirely confident of this part.

When the element type is a `forwardRef` return value, that description
is definitely right, because that's what the type of `forwardRef`
says.

For a class component-type, what you get at a ref is an instance of
the class.  IOW it's the actual component instance that the element
was used as a spec for.  And indeed that seems to be the instance type
one sees as the `React$AbstractComponent` type parameter.

For a function component-type… well, you can't use `ref`.  So an
appropriate type to use here is `mixed`, i.e. the type of values you
can't do anything with.


#### Variance

Because the `Config` type parameter (i.e. the config type) is all
about describing requirements on an *input*, it behaves like the type
of a function's argument, as marked by that `-` sigil which indicates
to Flow that it's an "input" or "contravariant" type parameter.  This
means that if `PropsA` is a subtype of `PropsB`, then
`React$AbstractComponent<PropsB, Instance>` is a subtype of
`React$AbstractComponent<PropsA, Instance>`, running in the reverse
direction.  Similarly `React$ComponentType<PropsB>` is a subtype of
`React$ComponentType<PropsA>`.

On the other hand, because the `Instance` type parameter (i.e. the
instance type) is all about something you get as an *output* from the
element that the overall type is used to describe, it behaves like the
return type of a function, as marked by that `+` sigil, which
indicates to Flow that it's an "output" or "covariant" type parameter.
This means that if `InstanceA` is a subtype of `InstanceB`, then
similarly `React$AbstractComponent<Props, InstanceA>` is a subtype of
`React$AbstractComponent<Props, InstanceB>`.

Together, these mean for example that `React$AbstractComponent<empty,
mixed>` is the common supertype of all possible types
`React$AbstractComponent<C, I>` for any types `C` and `I`.  That's
because `empty` is a subtype of all possible `C` and `mixed` is a
supertype of all possible `I`.  This is why the form with `empty` and
`mixed` appears in the definition of `React$ElementType`.
