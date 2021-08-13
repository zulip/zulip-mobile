# Handling "safe areas" in the visual layout

Some devices, like the iPhone X, have notches and native UI elements that
can overlap important content if we're not careful. We generally want the
boring, background part of elements to occupy the insets, and nothing else.
(We do let the lightbox image extend through the insets. This is a common
design choice, and the user can always zoom out to see what was hidden.)

We generally follow React Navigation's recommendations in their
[doc](https://github.com/zulip/react-native) on safe areas. React
Navigation's built-in UI elements help us by handling the insets in some
places. But the available built-ins don't solve the entire problem, and we
also [choose not to
use](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/react-nav.3A.20headers/near/1126189)
some of them because of their questionable design. Our own custom components
have to be part of the solution.

We use
[`react-native-safe-area-context`](https://www.npmjs.com/package/react-native-safe-area-context),
on React Navigation's recommendation.

## Rules for handling safe areas

1. As part of every component's interface, we should include how it's meant
   to interact with the safe area.
    - Most components aren't aware of the safe area: they don't do anything
      about it, and they assume they are rendered entirely inside it. So
      this is the default, and we generally won't mention it in the jsdoc in
      those cases.
    - Some components expect to occupy the horizontal insets, some the
      bottom inset, and some the top inset. (In principle there could be
      other valid combinations.) For example, a header component should
      occupy at least the top inset so that the header's background extends
      to the top edge of the screen. This should be announced in the jsdoc,
      saying why the component occupies the inset(s).
2. If a component wants to occupy any of the insets, it should generally do
   so with a `SafeAreaView`, with `"padding"` for `mode`, and with the
   intended `edges`. We prefer this component over `useSafeAreaInsets` and
   friends, where possible, because it does the layout calculations
   natively. If we have to look at inset dimensions in JavaScript, they
   couldn't be up-to-date because they've been carried over React Native's
   asynchronous bridge, and there will be a flicker when the insets change
   (e.g., on orientation changes).
3. If a React component is meant to occupy any insets, then its layout
   parent should adapt to allow it to do so, so that the inset distance
   isn't covered twice. This generally means omitting a padding
   `SafeAreaView` wrapper from the parent, if present, putting one in the
   child, and adjusting the wrapper's other children as necessary to
   compensate (e.g., by giving them `SafeAreaView`s, preferably with margin
   instead of padding, to show they don't care what fills the space). There
   are two reasons the parent should adapt:
     - When it's a case where the child has a stronger claim to choose what
       goes in the insets than the parent does, e.g., to extend its own
       background to the edge of the screen. This comes up a lot with
       list-item elements that want to extend their backgrounds to the left
       and right edges of the screen, while keeping their meaningful content
       within the safe area.
     - On iOS, at least, a `SafeAreaView` doesn't change what padding/margin
       it applies based on its position relative to the actual insets or
       other `SafeAreaView`s. It just statically applies the inset distance,
       wherever it is; a `SafeAreaView` nested in another `SafeAreaView`
       will duplicate the padding/margin. So it's not convenient to make
       components agnostic to whether an ancestor occupies the insets, and
       we have to keep careful track of where we handle the insets. See the
       "iOS" section for more on the relevant constraints here.


## iOS

We were surprised to
[find](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/react-native-safe-area-context.20padding/near/1230454)
the following [hypothesis](https://github.com/zulip/zulip-mobile/pull/4893#discussion_r668412622) wasn't true:

> I think if you make a `SafeAreaView` at a place where it's actually completely inside the safe area -- for example, because it's nested other `SafeAreaView`s that provided the appropriate padding on each side -- then it has no effect.

It seemed like it should be true, especially because that's how the relevant
iOS API works, namely [the `safeAreaInsets` property on
UIView](https://developer.apple.com/documentation/uikit/uiview/2891103-safeareainsets?language=objc).
But Greg
[found](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/react-native-safe-area-context.20padding/near/1230523),
"[F]or some reason it's [not calling that method on the relevant view
itself](https://github.com/th3rdwave/react-native-safe-area-context/blob/cd8dd60d035a44c22459b2c890e6512e5796396e/ios/SafeAreaView/RNCSafeAreaView.m#L76),
i.e. the `RNCSafeAreaView`. Instead, it [walks up the tree to the enclosing
`RNCSafeAreaProvider`](https://github.com/th3rdwave/react-native-safe-area-context/blob/cd8dd60d035a44c22459b2c890e6512e5796396e/ios/SafeAreaView/RNCSafeAreaView.m#L88-L94),
and asks what *that* view's `safeAreaInsets` is. Which is... just the wrong
question."

So that explains why every `SafeAreaView` uses the same values for
margin/padding at a given time. They're not getting the values from their
own position, but from the position of their shared `SafeAreaProvider`.

We
[tried](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/react-native-safe-area-context.20padding/near/1231222)
changing it to get `safeAreaInsets` from the self instead of the provider.
This seemed to make the above-quoted hypothesis true, which was great—except
we noticed a bug, which is plausibly the reason for not doing it this way.

To understand the bug, note that the "self" approach will predictably affect
how `SafeAreaView`s behave when they're involved in slide animations near
the edges of the screen. For example, if the left edge of a `SafeAreaView`
is sliding left toward the edge of the screen, and it has entered the left
inset, then its left padding should increase with each frame so that the
content it's guarding will stay still within the safe area. See
[videos](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/react-native-safe-area-context.20padding/near/1231279)
of this happening with a navigation transition.

We do see this happening approximately, but not perfectly. Greg
[describes](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/react-native-safe-area-context.20padding/near/1231377)
after seeing those videos,

> It looks like the whole content of the page has some jank -- specifically
> some jitter on the left edge, in the last moments before it lands where
> it's going. I think that probably indicates some lack of synchronicity.
> Like it's looking up what the inset is, and it gets the answer as of right
> now… but then it uses that answer for the next frame and the next. And
> when there's an animation happening, the answer is changing, so the answer
> is wrong by the time it's laying out those later frames.

Greg then
[found](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/react-native-safe-area-context.20padding/near/1231419)
a piece of code in the library's iOS native layer that "does look to me kind
of suspiciously like it's setting some data that the RN layout engine will
use for the next frame -- not like it's using an API where it gets asked to
provide some information on each frame."

This lack of synchronicity (even within the native layer—this is independent
of the problem with `useSafeAreaInsets` and friends, due to RN's
asynchronous bridge) might be due to a fundamental limitation in React
Native.

Anyway, we don't want that jitter, and this is plausibly explains why the
library has each `SafeAreaView` ask for its provider's, not its own, idea of
the necessary padding/margin.

This bug is probably a factor in how rough things look when you change the
device orientation on iOS.

## Android

We've never seen a case where an Android device has nonzero insets. As far
as we've seen, the whole app seems to occupy a clear rectangle given to it
by the system. It's below the status bar, and there are no overlapping
notches or native UI. When this is the case, each `SafeAreaView` will
appropriately act as a plain `View`. See
[discussion](https://chat.zulip.org/#narrow/stream/243-mobile-team/topic/react-native-safe-area-context.20padding/near/1230471)
for more observations on Android.
