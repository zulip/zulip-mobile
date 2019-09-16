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


### Mentioning people

**No GitHub @-mentions:** GitHub makes it tempting to refer to people
by an @-mention of their GitHub username, like `@gnprice`.
Unfortunately this is a misfeature:

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
them in the PR thread.

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
