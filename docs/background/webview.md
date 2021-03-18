# WebView

We show the message list inside a browser environment, in a `WebView`
component. For an overview of why we use a WebView for this, see
[this CZO thread](https://chat.zulip.org/#narrow/stream/48-mobile/topic/Message.20List.20History/near/809351).

## Styling

The message list styles are controlled by two files:
`src/webview/css/css.js` and `src/webview/static/base.css`.


### Lengths: px vs rem; no em

For CSS lengths in the webview, we use the two units `px` and
`rem`.  We do not use `em`.

Specifically, we use `rem` for the size of text, and `px` for
everything else.  See our [style guide](../style.md) for more details.

We do this because it implements in the webview the same behavior
that's standard for native mobile apps, and because it's important for
accessibility.  Detailed reasoning is below.

Background on what each unit means:

* A length in `px` is exactly that many [logical pixels](layout.md).
  In particular this is an approximately constant physical length
  across devices, and across different system settings: `16px` is
  approximately 0.1 inches or 2.5mm, and might be as large as about
  0.13 inches or 3.2mm.

* A length in `rem` scales with the font size at the root of the
  document, which in turn [scales with](layout.md) the system
  font-size settings.  By default `1rem` equals `16px`, but depending
  on user settings it can be a bit smaller or much, much larger.  In
  particular, many visually impaired users set their devices to a very
  large font size.

* A length in `em` scales with the font size of the current element or
  its parent (depending on what property it's used for.)  This is like
  `rem` except it depends additionally on `font-size` values found
  elsewhere in the stylesheet.


### Why `rem` and not `em`

When `em` is used, it becomes complicated to understand what length
the value found in a given rule actually works out to -- and the
answer can even vary for a single rule as applied in different places.

In a website with a variety of design contexts where different kinds
of text appear with different sizes, and with detailed text style
rules that appear across multiple kinds of text, that variation can
potentially be a useful feature.  This is what `em` is for and why
some web-design advice urges using it.

In our message list, there is just one kind of text that appears at
significant length: the message bodies.  Other text comes in small
pieces, and in highly structured contexts like timestamp pills or the
emoji + counts in reactions.  There are few if any style rules
affecting text in multiple contexts (and if there are, that's likely a
bug), which means little to no benefit to be had from letting a rule's
meaning vary across contexts.  Meanwhile, using `em` means a major
cost in comprehensibility as the reader has to do a global search for
`font-size` rules that might apply to ancestors of the given element.

At one time (before [6ef229e42][]) our CSS had a chaotic mixture of
values in `em` and `px`.  Because of the variation in `font-size` and
correspondingly in the meaning of `em`, this meant that to understand
what a given length meant, and what the constraints were on changing
it, was a complicated matter.  That in turn made it hard to make
changes, and easy to introduce small bugs.

[6ef229e42]: https://github.com/zulip/zulip-mobile/commit/6ef229e42

For more discussion, see the following articles:
* https://zellwk.com/blog/rem-vs-em/ (detailed background, and
  examples of several approaches)
* https://j.eremy.net/confused-about-rem-and-em/ (advises `em`, for
  web design with a variety of kinds of complex text)


### Why (mostly) `px` and not `rem`

Typical advice for web design is to use `rem` or `em` for nearly all
lengths.  This means that when the font size grows or shrinks, not
only the text but the whole layout scales with it, including padding,
margin, and images.

But on mobile, if you go to a device's settings and [change the font
size](layout.md), you'll find this is not at all what apps do.  When
you make the font size giant, the text in an app grows with it -- but
everything that *isn't* text stays the same.  Icons in the UI; user
avatars; padding around text; padding or margin between elements;
indentation of items in a list; all stay exactly the same.  This is
true on Android and iOS, and of flagship apps from Google, Apple,
Facebook, and others.

On Android, an app implements this behavior by using `sp` for text and
`dp` for everything else, following the upstream recommendation; see
our [layout.md](layout.md).

In a webview, this translates to using `rem` for text and `px` for
everything else.  So that's what we do.

To understand why this is the standard on mobile, consider that mobile
screens are often small and the layouts don't have a lot of room to
spare.  If when a user doubled their text size to make it readable for
them, that also doubled all the spacing in the UI... then that could
leave very little room for the actual text they wanted to read.  See
our commits [ebaffb456][] and [3dc7fee83][] for discussion.

[ebaffb456]: https://github.com/zulip/zulip-mobile/commit/ebaffb456
[3dc7fee83]: https://github.com/zulip/zulip-mobile/commit/3dc7fee83
