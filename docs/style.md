# Style Guide

(This is not at all complete.)


### Index:

* [Git: commits, commit messages](#git)
  * [Communicating in the commit message](#commit-message)
  * [Squashing and not-squashing commits](#commit-series)
  * [Commit messages, comments, code](#commit-messages-code)
    * [[link](#update-commit-messages)] Update commit messages when you
      update a branch.
    * [[link](#commit-messages-vs-comments)] Commit messages
      vs. comments.
  * [Mentioning people](#mentioning-people)
  * [Mentioning commits](#mentioning-commits)
* [GitHub: PRs, issues](#github)
  * [[link](#mention-related-issues)] Mention all related issues in PR
    or new issue.
  * [[link](#mention-fixed-issue)] Mention a fixed issue in both PR
    and commit message.
  * [[link](#fixes-format)] Write `Fixes: #1234` when fixing an issue.
* [JavaScript, Flow, JS libraries](#js)
  * [[link](#types-named-type)] Don't put "type" in the name of a
    type, usually.
  * [[link](#invariant-assertions)] Use `invariant` for runtime
    assertions the type-checker can use.
  * [[link](#immutable-provide-type)] Always provide a type when
    writing an empty `Immutable` value.
* [Internal to Zulip and our codebase](#zulip)
  * [Zulip API bindings](#zulip-api-bindings)
    * [[link](#import-api)] Use `import * as api` and `api.doThing(…)`.
  * [Zulip data model](#zulip-data-model)
    * [[link](#avoid-display-recipient)] Avoid using
      `display_recipient` directly.
* [WebView: HTML, CSS, JS](#webview)
  * [HTML](#webview-html)
    * [[link](#webview-avoid-colliding-classes)] Avoid classes that
      the server might use in messages.
  * [Styling/CSS](#webview-styling)
    * [[link](#px-rem-no-em)] Use `px`, sometimes `rem`, no `em`.


<div id="git" />

## Git: commits, commit messages

### See also

**Zulip guide to [clear and coherent commits][].** This has important
principles about structuring your changes, and about writing commit
messages.

[clear and coherent commits]: https://zulip.readthedocs.io/en/latest/contributing/version-control.html


**Our [Git guide](howto/git.md).** This includes some valuable tips
you may not know, even if you've been using Git for a while.  The
Zulip maintainers spend a lot of time reading Git commits, which is a
major reason we keep high standards for commit clarity.  These tips
will help you get a lot of value from reading Git history too.


<div id="commit-message" />

### Communicating in the commit message

**See also:** The Zulip guide to [clear and coherent commits][] (same
link as above.)


**Answer in the branch the reviewer's questions.**
Any time a reviewer asks a "why" question about a PR, we'll want the
answer to make it into the actual commits.  Or if they find something
confusing, we'll want it to be clear in the actual commits: ideally
the code itself makes it clear, or if not then comments or the commit
messages explain it.


**Answer questions the reviewer *should* ask.**
The reviewer will be trying to understand your change: what it does,
and why.  Help them out before they even see the branch, by answering
their questions in the code, comments, and commit messages.

Here are some particularly important questions the reviewer may be
asking -- at least in their head -- when they look at each piece of
your change:

* Hmm, was that change intentional?  (E.g.: the commit message said
  the point is to implement feature A, but this also changes how
  feature B looks.)

* Is this part something we should have been doing all along?  Or is
  it newly needed because of the other changes you're making?

* (If the old code had something wrong with it:) What were the
  consequences of the problem; did it have any effects on what the
  user saw?

* What source were you relying on to understand [this API / these
  guidelines / this upgrade process / this platform feature]?  (A
  link or two can be very helpful.)

* How did you generate the new [foo] -- what kind of input did you
  provide to [foo-making tool]?  (Where "foo" is an icon, an Xcode
  config file, etc.)


<div id="commit-series" />

### Squashing and not-squashing commits

Here again, see also the Zulip guide to [clear and coherent
commits][].


**When in doubt, leave as separate commits.**
It's easy to squash commits that are separate, and can be more work to
separate changes that were squashed.  So when in doubt about whether
to squash some changes, send the PR with them unsquashed, and ask the
reviewer.

(This is in the "clear and coherent commits" guide, but bears
repeating next to any advice about squashing commits.)


**Move code in one commit, rather than add + delete in two.**
Whenever code is being moved, it's usually best to make the move in
one commit rather than separately add and delete.  For an example,
see #3310.

This makes it self-contained to see that the old and new code match up
and to understand where the new code comes from (in particular, that
it wasn't newly made up.)

Sometimes in complex cases it's a better tradeoff to do them
separately for other reasons.  When doing so, be sure to be more
explicit about what's going on to help the reader make up for it.


**Squash small commits when they're easier to understand together.**
This often applies to a change that produces some data and another
that consumes it.  For an example, see [the merge of #3263][].

On the other hand if either change is large or complex, then it's
often a better tradeoff to do them separately.  Just be explicit about
what's going on: in particular, in the earlier commit message make
clear that the other side is coming soon, and in the later one mention
that the other side was just added.

[the merge of #3263]: https://github.com/zulip/zulip-mobile/pull/3263#issuecomment-460918886


<div id="commit-messages-code" />

### Commit messages, comments, code

<div id="update-commit-messages" />

**Update commit messages when you update a branch.**
The commit message is a key part of the content of a commit.
So when you revise in response to code review feedback, be sure
to edit the commit message as needed to match.


<div id="commit-messages-vs-comments" />

**Commit messages vs. comments.**
In general:

* Use the commit message for information that's specific to the change
  between this commit and its parent.  In particular, for information
  about why the new version is better than, or not worse than, the old
  version.

* Use comments, or the code itself, for information that's relevant to
  the new version of the code on its own -- for understanding the new
  code from scratch as it is.

  * Where possible, it's best to use names and types to make the
    information clear in the code itself.  Many kinds of information
    don't fit there; for those, use comments.


<div id="mentioning-people" />

### Mentioning people

**No GitHub @-mentions:** GitHub makes it tempting to refer to people
by an @-mention of their GitHub username, like `@gnprice`. Unfortunately
this is a misfeature in commit messages:

* GitHub will turn this into a notification for the person every time
  a version of the commit is rebased and pushed somewhere, which is
  usually totally irrelevant for them -- e.g. someone took a long
  stretch of history and rebased it and pushed that to their own
  clone.

  That person is doing something perfectly reasonable because it's off
  in their own sandbox, and the author (you) had a perfectly
  reasonable intention to mention the person when making a change in
  the project, but GitHub turns the combination of those into spam.

* It also ties the information unnecessarily to GitHub, which for a
  long-lived project may not be its home forever.

If you want to send someone a notification about a change, @-mention
them in the PR thread, not in a commit message.

To refer to them in a commit message, use one of the conventions
below.


**Consider just a name:** If there's further context -- like a chat
link where you're referring to what someone said in that conversation
-- then just a name like "Greg" can be natural and unambiguous.


**Consider `Reported-by:` and friends:** The convention of the Linux
kernel project, and the upstream Git project, is to end the commit
message with a block of lines referring to people who wrote the
commit, reviewed it, approved it, etc.  These identify people by name
and email address, for complete unambiguity.

We don't have a habit of using this in our codebase, but that doesn't
stop it from working just fine.  For an example, see 338036e0c which
has a line

    Suggested-by: Anders Kaseorg <anders@zulipchat.com>

In the kernel, the most numerous of these is actually `Cc:`, which
basically amounts to an @-mention!  Other common lines include

    Reported-by:
    Debugged-by:
    Suggested-by:
    Co-developed-by:
    Tested-by:

and there's no fixed list; people invent others.


<div id="mentioning-commits" />

### Mentioning commits

**Use 9 (or 10) hex digits to identify a commit.**
To help make this convenient, you can tell Git to routinely print
9-digit abbreviations for you by setting `git config core.abbrev 9`.

Rationale: The full 40 hex digits is a lot, and generally doesn't flow
well in prose.  On the other hand 7 hex digits, which is what GitHub
shows in its UI whenever it doesn't show 40, is short enough that
there's a material risk of collisions: in zulip.git there are already
a handful of commits that are ambiguous when identified by just 7
digits, and in a very large project like the Linux kernel such
collisions can become routine.

A 9-digit abbreviation is still short enough to fit well in running
text; and it's long enough that it's extremely unlikely any given such
abbreviation will ever be ambiguous.


<div id="github" />

## GitHub: PRs, issues

<div id="mention-related-issues" />

**Mention all related issues in PR or new issue.**
When you submit a PR, mention in the PR description any issue it's
intended to fix; or intended to help with; or could make worse; etc.

Similarly, when you file an issue, mention any issue you're aware of
that it's similar to, or might interact with, etc.

These cause GitHub to automatically link back from the other issue to
the new PR or issue.  The cross-references in both directions are
essential for:
* finding previous discussions rather than repeat them;
* getting context on the PR by seeing the issue discussion;
* finding what happened to an issue by seeing the PR.

Be sure to use the PR (or issue) description, not the title: for
whatever reason, GitHub doesn't count links in PR titles for creating
automatic backlinks.


<div id="mention-fixed-issue" />

**Mention a fixed issue in both PR and commit message.**
When you submit a fix for an issue, please refer to it *both*
* in the PR description, and
* in the commit message of the main commit that fixes it.

The commit message is important because the commits in Git become our
primary record of what we did: people will read the commit message and
want to be able to look at the issue for context.

The reference in the PR description is important for the sake of the
GitHub website, for the reasons mentioned above.  When the reference
is only in a commit message, GitHub doesn't use that information as
usefully.

You might find that a reference in a commit message causes GitHub to
show a noisy list of backlinks in the issue thread, after you make
revisions to the branch and push new versions of the commits.  Please
include the reference anyway, despite that UI bug in GitHub.  We'll
live with a little noise on the issue threads, and the references are
extremely helpful when [reading the Git log](howto/git.md).


<div id="fixes-format" />

**Write `Fixes: #1234` when fixing an issue.**
When a commit fixes an issue, use a line like `Fixes: #1234` at the
end of the commit message.

If there are any `Reported-by:` or similar lines (as discussed above),
put it next to them.  See for example 58028d6d1:

    Author: Greg Price <greg@zulipchat.com>

        android notif: On open when app in background, emit the event.

        When the user has opened the app and then moved on to something else,
        [... more details ...]

        Fixes: #3582
        Reported-by: Vishwesh Jainkuniya <gitvishwesh@gmail.com>
        Debugged-by: Vishwesh Jainkuniya <gitvishwesh@gmail.com>

GitHub accepts a range of [other magic words][gh-close-issue-keywords]
that have the same effect.  Please stick with "Fixes"; it's helpful to
pick just one, and that's the one we use.

[gh-close-issue-keywords]: https://help.github.com/en/github/managing-your-work-on-github/closing-issues-using-keywords


<div id="js" />

## JavaScript, Flow, JS libraries

<div id="types-named-type" />

**Don't put "type" in the name of a type, usually**:
Specifically, when naming a type, we generally put "type" in the name
only if the *values* of the type are themselves to be thought of as
"the type of" something.

The general principle is that a type's name is a description of the
values of the type.  If `x` has type `ThingJig`, then `x` should
indeed be a thing-jig (whatever that might mean.)

So for example we have `export type EmojiType = 'image' | 'unicode'`,
because its values are interpreted as referring to "image emoji" and
"Unicode emoji" -- so each value is a particular type of emoji.

Similarly a React `ComponentType` value is *a type of component*: so
the values include `View` itself, but not any particular instance of
`View`.

If `FooType` is just the type of "foo"s, try calling it simply `Foo`.
If there are several types that could fit that name, find a name that
more specifically expresses how one is different from the others:
perhaps `FooDetails`, `FooId`, `PartialFoo`, or `FooView`.


<div id="invariant-assertions" />

**Use `invariant` for runtime assertions the type-checker can use**:
If there's a fact you're sure is true at a certain point in the code,
and you want the type-checker to know it so it will accept the code
that comes after, then go ahead and assert that fact with the
`invariant` function.

Flow [has a feature][flow-invariant-pseudodocs] (albeit not well
documented) where a call `invariant(foo, …)` is treated much like
saying `if (!foo) { throw new Error(…); }`.  Meanwhile at runtime,
that's essentially what the implementation of `invariant` does.

Use `invariant` only for conditions which, if they ever failed, would
definitely mean a bug within our own zulip-mobile codebase.

[flow-invariant-pseudodocs]: https://github.com/facebook/flow/issues/6052


<div id="immutable-provide-type" />

**Always provide a type when writing an empty `Immutable` value**:
Whenever you create an empty `Immutable.Map`, `Immutable.List`, or
so on, specify the intended type explicitly.  For example:
```js
const map: Immutable.Map<number, string> = Immutable.Map(); // good

const map = Immutable.Map(); // BAD -- don't do
```

This is essential in order to get effective type-checking of the
code that uses the new collection.  (It's not clear if this is a bug
in Flow, or a design limitation of Flow, or an issue in the Flow types
provided by Immutable.js, or some combination.)


<div id="react-function-prop-defaults" />

**Don't use React `defaultProps` for function components**:
When a React function component has a default value for one of its
props, express that with a normal JS idiom, not with React's
`defaultProps` feature.  This also means that in the component's type,
the prop should be marked as optional (with `?:`).

For example, if converting into a function component a class component
that had a `defaultProps` like so:
```js
  static defaultProps = { foo: true };
```
a good translation is to use JS object destructuring with a default
value, with a line like this at the top of the new function:
```js
  const { foo = true } = props;
```
and to change `foo: boolean` to `foo?: boolean` in the `Props` definition.

The main reason for this is to keep the default, and the fact there is
a default, visible at the top of the function.  This is helpful for
reading the component's implementation as well as for looking at its
interface in order to use it elsewhere.


<div id="zulip" />

## Internal to Zulip and our codebase


<div id="zulip-api-bindings" />

### Zulip API bindings

<div id="import-api" />

**Use `import * as api` and `api.doThing(…)`**: When invoking our
binding for an endpoint of the Zulip server API, write the code like
this:
```js
import * as api from '../api';

// …

    api.subscriptionAdd(auth, [{ name: stream.name }]);

```

rather than like this:

```js
// BAD
import subscriptionAdd from '../api/subscriptions/subscriptionAdd';

// …

    // BAD
    subscriptionAdd(auth, [{ name: stream.name }]);
```

We do this because a lot of the names in our API bindings are also
quite natural names for other things in our code, like action
creators.  Moreover, the API bindings tend to be imported into scope
in exactly the same places as we're defining those other values.  The
`api.*` naming gives a convenient, regular way to tell the API binding
apart from related functions at different layers.


<div id="zulip-data-model" />

### Zulip data model

<div id="avoid-display-recipient" />

**Avoid using `display_recipient` directly**: When inspecting a
`Message` object, or a relative like `Outbox`, never consume its
`display_recipient` property directly.  Instead, always use one of the
helper functions found in `src/utils/recipient.js`.

One reason we do this is because the type and the semantics of that
property, which we take directly from message objects provided by the
Zulip server API, are complicated and have some legacy quirks; using
the helper functions helps keep other code simpler and well-typed.
Using the helper functions also helps us find all the places in the
code where we're using a given aspect of the `display_recipient`
semantics, which makes refactoring easier.


<div id="webview" />

## WebView: HTML, CSS, JS

<div id="webview-html" />

### HTML

<div id="webview-avoid-colliding-classes" />

**Avoid classes that the server might use in messages:** In our own
HTML in the webview, we avoid using any class names which appear in
message content as rendered by the server.

There isn't a single comprehensive list of these.  Most of them can be
found in `static/styles/rendered_markdown.css` in zulip/zulip, which
is where the webapp styles the message content.  In addition to names
used in current Zulip Server versions, we need to avoid those used in
the past -- not only because some servers will still be on old
versions, but also because old messages generally aren't re-rendered
into HTML even after the rendering logic changes.

(In principle we should take steps to avoid future names, too.  We
don't worry about that for now, because this hasn't often been a problem.)

See [chat discussion][class-conflict-chat] for further rationale.

[class-conflict-chat]: https://chat.zulip.org/#narrow/stream/48-mobile/topic/Weird.20timestamps/near/1075485


<div id="webview-styling" />

### Styling/CSS

<div id="px-rem-no-em" />

**Use `px`, sometimes `rem`, no `em`:** For CSS lengths in the
webview, we use `rem` for text and `px` for everything else.
We do not use `em`.

We use these units like so:

* All values for `margin` or `padding`, and most `width`, `height`,
  and other lengths, are in `px`.

* Lengths for *the size of text* are in `rem`.  This includes almost
  all values for `font-size`.  In a few cases another length property,
  like `width` or `height`, is describing something that functions as
  text -- e.g., an emoji -- and this includes those cases.

Put another way: the following scale with the font size:
* text, and
* a few text-like elements like emoji,

while everything else is independent of font size, including:
* avatars,
* UI icons, and
* all padding and margin, including padding around text.

We do this because it implements in the webview the same behavior
that's standard for native mobile apps, and because it's important for
accessibility.  For detailed background and rationale, see
[docs/background/webview.md](background/webview.md#styling).
