# Style Guide

(This is not at all complete.)


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


### Commit messages, comments, code

**Update commit messages when you update a branch.**
The commit message is a key part of the content of a commit.
So when you revise in response to code review feedback, be sure
to edit the commit message as needed to match.


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


## GitHub: PRs, issues

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


## Internal to our codebase

### Zulip API bindings

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


## WebView: HTML, CSS, JS

### HTML classes

The set of HTML classes that can appear in the message-content HTML
should be considered part of the Zulip API. To prevent unexpected
interference, we should avoid using any of them in our own HTML that
wraps and enhances the message-content HTML. This should be observed
even for names that are no longer used in current Zulip Server
versions -- not only because some servers will still be on old
versions, but also because old messages generally aren't re-rendered
into HTML even after the rendering logic changes.

We could consider guarding against names that show up in future server
versions, with a mildly annoying name-prefixing scheme. But in the
status quo, problems have been infrequent, so we can consider that
later.

One observed problem was with our use of `timestamp` (now called
`msg-timestamp`) as a class, for our timestamp pills. For just a few
weeks, between zulip/zulip@648307ef3 and zulip/zulip@6ea3816fa, some
messages were sent in which the `timestamp` class was present in the
message-content HTML, and it caused the timestamp pills to display
very weirdly. So we stopped using `timestamp` and renamed the existing
occurrences to `msg-timestamp`, and those messages showed up
correctly.

### Styling/CSS

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
