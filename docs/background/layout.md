# About layout

## Sizes: px, dp, sp, and friends

The units of measurement in UI layout are a bit complicated.  When doing any
UI work, it's important to understand them anyway.

### Display size; logical pixels

Dimensions in React Native are written without explicit units, and are
implicitly in units of **logical pixels**, which we abbreviate `px`.
(Android calls this a `dp` or "dip"; iOS calls it a "point".)  One logical
pixel corresponds to some number of real physical pixels on the display.
The number will be higher for higher-density displays, to try to make
1px ~= 1/160 inch ~= 0.16mm.

(RN upstream's documentation is inconsistent about what to call this unit;
it often says "logical pixel", but sometimes follows Android in saying
"density-independent pixel" and sometimes iOS in saying "point".  We'll
stick to "logical pixel", which seems the clearest and most unambiguous.)

The device comes with a default value for the conversion factor of logical
pixels to physical pixels, but the user can change it in the system
settings.  This setting is called "Display size" on stock Android O,
"Display zoom" on iOS, and "View mode" on some Android devices.

The ratio of physical pixels to a logical pixel may be an integer like 1, 2,
or 3 (the default settings on many devices), or another value like 2.61 or
3.5 (the defaults on the iPhone 6+/7+/8+ and the Pixel 2 XL respectively),
or even 4.5 (the largest setting on a Pixel 2 XL).

For example, when we write `height: 48` in the style for a component, the
component's height will be 48px, aka 48dp on Android or 48 points on iOS.
With the default settings on any given device, this will be about
48/160 inch = 0.3 inch =~ 7.6mm; it might be shorter or taller if the user
has adjusted their settings.  It might be as few as 48 real physical pixels,
or as many as 216 (in 2018, and probably even more in the future.)

Almost all layout is done in terms of logical pixels (with a small variation
for text sizes, discussed below), leaving the OS to translate to physical
pixels on the display.  As a result, our code should basically never know
about this scaling factor.  Where it is important to know is for us humans,
inspecting and debugging layouts.

### Font/text size

Separately, the user can adjust the size of text.  This is also in system
settings, generally called "Font size" on Android or "Text Size" on iOS.

On Android, the way this works for apps is that there's a unit called `sp`.
By default, 1 sp = 1 dp (= 1 px, in RN terms), regardless of how many
physical pixels are in a logical pixel (aka a `dp` or `px`), but the user
can make it a bit smaller or much larger.  Generally an app's font sizes are
measured in `sp` while the rest of a layout is in `dp`.

On iOS, the term for this is "Dynamic Type".  Details would be good to add
here.

### Further reading

The Material Design guidelines have a helpful [page about units and
measurements][material-units], which also discusses the Android story.

There's a [nice diagram][iphone-resolutions] of how this works out for
different iPhone models.  Note that the diagram only shows the default for
each model.

If you have an Android phone available, [this Play Store app][solberg-tools]
is helpful for seeing what a `dp` and an `sp` work out to on your device and
how the user settings affect them.  See the "Screen dimensions" screen of
the app.

[material-units]: https://material.io/guidelines/layout/units-measurements.html
[iphone-resolutions]: https://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions
[solberg-tools]: https://play.google.com/store/apps/details?id=com.roysolberg.android.developertools
