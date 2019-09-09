# Crunchy shell, soft center

One architectural pattern that can be extremely helpful, and which we
try to use where applicable, is the *crunchy shell and soft center*.
This means:

 * All parsing of messy data-from-the-network happens at the edge,
   as soon as possible.

 * The parsing logic at the edge constructs new, inward-facing data
   structures from the messy data it gets.  It meticulously ensures
   that the data it produces has the expected format.  Where the
   messy input does something unexpected that we aren't prepared
   to cleanly handle, the input is rejected at the edge.

 * All the application code on the inside deals only with the nice,
   well-formatted data produced by the parsing logic at the edge.
   As a result it needs many fewer boring checks for null, for
   strings that should parse as integers but don't, etc., etc.
   The real application logic it's expressing is easier to read,
   and it's less prone to bugs.

 * The metaphor: the edge is "crunchy" with parsing and validation,
   protecting the inside so it can safely be "soft".

 * In particular, when data comes in that doesn't match expectations,
   a program without a "crunchy shell" will run into that fact
   somewhere deep inside application code.  It's likely to be missing
   any logic there to deal with the situation, and then to crash; if
   it does handle it, it may have already half-processed the data,
   making it too late to cleanly ignore.

   By contrast when bad data is caught by a "crunchy shell", it gets
   cleanly ignored or rejected.


## Applying it

The "crunchy shell, soft center" pattern is generally helpful whenever
a system has to take data from "the outside" that it doesn't itself
control, and has to look inside the data and act on details of its
contents.  For example:

 * In an OS kernel when handling a system call (a request from a user
   process), the code will at the very beginning validate the basic
   structure of the data it's given -- the pointers are to the
   process's own legitimate memory, the flags are valid, etc. -- and
   immediately return an error if invalid.

   Moreover if part of the data is found in buffers in the process's
   memory (which requires careful, paranoid handling to inspect from
   the kernel), the early part of the syscall will typically construct
   new, inward-facing data structures by copying that data into kernel
   memory, where it's much simpler for everything else in the kernel
   to safely handle.

 * In a web browser, the messy, error-filled HTML that a random server
   might send gets parsed early on and converted to the DOM -- a new,
   well-structured, inward-facing data structure which the bulk of the
   other logic in the browser can then work with.

 * In a mobile app like Zulip, the data we get from the server can
   potentially have all kinds of warts and complications and surprises
   -- in particular it can be from an older version of the Zulip
   server, or a newer one, or one that's been modified in unexpected
   idiosyncratic or buggy ways.

   So, in new and newly-revised parts of the app, we generally have
   the code at the very outer edge that talks to the server validate
   the data it gets and convert it into a more uniform and convenient
   format.

   Major legacy parts of the app don't yet work this way, and that's
   been a recurring cause of bugs.


## Examples

Currently our most systematic, crunchiest shell is found in the
Android code handling FCM messages, the data from the server that
powers notifications.  See [`FcmMessage.kt`][], and see commits
f85d3250f, 58e074b31, cee71e005, 907410d5e, edf3c08e1, 1620867c7,
739e55ab5, 9b6f6fb9f for discussion and particularly interesting bits
of its step-by-step construction.  In particular 58e074b31 and
cee71e005 fix crash bugs in the app, in ways that were made easy and
obvious by building the crunchy shell.

[`FcmMessage.kt`]: ../../android/app/src/main/java/com/zulipmobile/notifications/FcmMessage.kt

A small example with a different flavor appears in the JS of our
message list WebView, where it examines the HTML of the message list
and pulls attributes off of it.  We don't entirely control that HTML
-- large pieces of it come straight from the Zulip server.  Even to
the extent that we do, the structure of it is encoded in
sometimes-complicated ways in our HTML templates... so when we make
assumptions about it, it's hard to be certain the assumptions are
right, and a crunchy shell is again useful.  See dd03939cb for this
example.


## More needed

In our JS code and the data it handles from HTTP requests it makes to
the Zulip server, there are a lot of spots that would benefit from a
crunchy shell -- a lot of spots where the code in the middle of the
app either has random checks and conditionals scattered through, or
bugs from the lack of those.  Most of these can be seen from a survey
through the type definitions in the API code under `src/api/`, for
example in [`modelTypes.js`][] -- every comment about something that
is present in some events but not some other responses, or that
appears in some server versions and not others, is a place where the
existing soft shell lets complexity through to the inside of the app.

[`modelTypes.js`]: ../../src/api/modelTypes.js

In particular, most of the data we get from the server is described by
Flow types which are only a wish or a hope -- the data is deserialized
from the server's JSON and never validated against the stated types.
The resulting JS objects make their way into our Redux store, and down
to the props passed to numerous React components, where they can and
do cause bugs when the stated types (which the application code relies
on) turn out not to quite match what the server sent.

In one possible version of a fully-constructed crunchy shell for the
app:

 * Essentially all the code in `src/api/` that returns data from the
   server would take the objects it gets from the JSON; pick out all
   the pieces it expects, validating that they're there; and
   re-assemble them into objects of a convenient internal shape.

 * That internal shape would be described by Flow types, much like the
   ones we have today -- and because those objects would be
   constructed directly by our code, the type-checker would be able to
   verify statically that they actually had the appropriate type.

 * One way the internal objects would differ from the JSON is that
   we'd use appropriate data structures like `Map`, or perhaps
   `Immutable.Map`, to represent maps instead of JS's overloaded
   `Object` type.

 * Another is that any properties we don't actually use, we simply
   wouldn't look at and wouldn't store in the internal object.

 * Another is that we could normalize away pitfalls in the server
   API's types, like the complicated type and semantics of
   `display_recipient` on a `Message` object.
