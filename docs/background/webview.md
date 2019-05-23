# WebView

The message list styles arecontrolled by the `css.js` file, which
gives us more powerful set of styles compared to the ones we use
in our React Native code.

## Sizes: px vs rem

We use two units 'px' and 'rem'. We differentiate between their use
for one strict purpose:

* any element in 'px' will not change its size
* any element in 'rem' will change its size proportionally with the
root font size of the `html` element

If you are curious why we would use 'rem' (and why not 'em') read
further these two articles:
https://j.eremy.net/confused-about-rem-and-em/
https://zellwk.com/blog/rem-vs-em/

## Usability considerations

Units like 'rem's are very frequently used for 'padding' and 'margin'
in web design. A style like `padding: 1rem;` has the wonderful property
of looking proportional to the font size, which might change depending
on different media queries.

We are explicitly not following that practice. After some research, it
become apparent that, naturally, different priorities exist on mobile.
With font increase, we will try to keep all other UI elements the same
size, not because this looks better (it doesn't) but because there is
not enough space on the screen for such luxuries.

For maximum usability and smart screen real-estate usage:

Things that should not change size:
 * buttons
 * padding, margin
 * loading indicators
 * avatars

Things that should change size:
 * text
 * elements that should be treated like text (emoji!)