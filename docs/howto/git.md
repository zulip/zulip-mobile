# Using Git

Git is a complex and powerful tool.  With some effort you can learn to do a
lot of things with it that make everyday workflows easier, help you produce
better code, and even help you understand a codebase better.

## Essentials

If you don't feel you have time to dig deep into Git right now, you should
still take a few minutes to do the bits in this section.

1. Get and use a graphical client (details below).  It helps a lot for
   seeing and understanding what's happening.

2. Try out [the "secret"](#git-log-secret) below for using
   `git log -p` effectively.

Then do come back and read more later. ;-)


## Setup

### Graphical client

It's important to have a graphical Git viewer/client you can use.  Any time
you do a rebase that's at all complex, or do anything where you're not 100%
sure what's happening in the repo, pull up the graphical client.

This can make a big difference in helping you see what things look like and
what your commands are doing.  That not only helps you do whatever you're
doing right now, but also means you'll learn Git faster.

For suggested clients, see [the Zulip
docs](https://zulip.readthedocs.io/en/latest/git/setup.html#get-a-graphical-client).


## Reading history

One of the things that makes Git so valuable is its facilities for
studying history -- both
* very recent history (e.g., rereading your own branch before you
  send a PR), and
* the distant past (e.g., tracking down when and why some piece
  of code became the way it is.)

This section will help you take advantage of these powerful abilities.


### 1. Use your graphical client

One great way to read history: use your graphical Git client!
Especially helpful for
* reading through the recent commits, or
* clarifying how branches are related to each other.


<div id="git-log-secret" />

### 2. The "secret" to using `git log -p`

Use `git log -p`, with this important secret:

* In the pager that `git log` puts you into, hit `/` to search, then enter
  the pattern `^c` -- that is, caret, then `c`.  Then hit `n`/`N` for
  next/previous match.

* This finds lines that begin with `c`.  Because of thoughtful design in
  the default format of `git log`, these are exactly the first line of the
  log entry for each commit.  So with this search pattern, you effectively
  get **keybindings for "next/previous commit"**.  This makes a huge
  difference in skimming quickly past boring commits without missing
  anything.

* For a further upgrade, use `git log --stat -p` (you might alias this as
  e.g. `git lsp`.)  Now every time you hit `n` or `N`, you see the commit
  message and complete list of affected files for the new commit -- a good
  summary to help decide whether to read in more detail or hit `n`/`N`
  again to move on.


### 3. Filter `git log` down to relevant commits

Use some of `git log`'s many features to filter down to commits you
care about.  For example:

* Filter to a range of commits with `git log A..B`.  E.g., to reread your
  current branch relative to upstream main, you might say
  `git log --stat -p upstream/main..`, or `git log --stat -p @{u}..`.
  (Greg has the latter aliased as `git usp`, and types it constantly.)

* Filter to changes touching certain files or directories:
  `git log PATHS`.

* Filter to changes touching lines that mention some pattern:
  `git log -G PATTERN`.

* Filter to changes adding or removing mentions of some pattern:
  `git log -S PATTERN`.  This feature is traditionally called the
  "pickaxe", presumably in honor of its power to mine just the right bit
  of historical/explanatory gold.

* Many more.  Do take a few minutes to skim through the documentation in
  `git help log` (or [this web version](https://git-scm.com/docs/git-log))
  to get an idea of what's available; and perhaps an hour now and then to
  read and try things in more detail.


### 4. Filter in your graphical client

Try all those `git log` filtering features in your graphical client -- it
may even support the very same command-line options to do it.  For
example, `gitk upstream/main..` shows basically the same information as
`git log --stat -p upstream/main..`, but graphically.


### 5. Git a summary, with `git log --oneline`

Try `git log --graph --oneline --decorate --boundary`.  (Quite a mouthful;
Greg has this aliased as `git k`, in homage to `gitk`.)  It can be a
lightweight alternative to your graphical client for simple, routine
situations, giving a compact list of commits each on just one line.

* To list the commits local to your current branch: `git k @{u}..`.
  (Greg has an alias for this, and types it constantly.)

* To list all your own local commits on all branches:
  `git k --branches @ --not --remotes=origin --remotes=upstream`.
  (For explanation, see `git help log`.)
