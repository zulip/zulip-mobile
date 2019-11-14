/* @flow strict-local */
import { Platform } from 'react-native';
import type { ThemeName } from '../../types';
import cssPygments from './cssPygments';
import cssEmojis from './cssEmojis';
import cssNight from './cssNight';

/** CSS fragment to support scrolling of KaTeX formulae. */
/*
  By default, KaTeX renders (non-inline) math into a div of fixed precomputed
  width. This will be cut off by the edge of the screen when the formula is too
  long -- and on a mobile device, that's very nearly always.

  The naïve solution of simply giving some part of the KaTeX fragment itself an
  `overflow-x: auto` style breaks terribly:
    * Margin collapsing no longer works, causing rendering artifacts. (This is
      particularly visible on integral signs, which are truncated into near-
      illegibility.)
    * `overflow-y: hidden` isn't respected. If KaTeX has used negative-position
      struts in its rendering (which it does frequently), there will always be
      vertical scrollability. (This may be a Chrome bug.)

  Instead, we modify the provided DOM to wrap each `.katex-display` div with two
  additional elements: the outer element is scrollable and `display: block`,
  while the inner element is fixed and `display: inline-block`. This suffices to
  insulate the KaTeX elements from the deleterious effects of scrollability.

  The inner of these elements also receives a border, to act as a UI hint
  indicating that scrolling is necessary: the right border will be cut off when
  the rendered element is too large. (The KaTeX itself will also be truncated,
  of course, but this may not be apparent if the cutoff falls between two
  symbols.)

  We also cut the KaTeX-provided margin somewhat. (Since the KaTeX fragment is
  isolated in the new divs, margin-collapsing can no longer occur.)
*/
const katexScrollStyle = `<style id="katex-mobile-scroll">
.zulip-katex-outer {
  display: block;
  overflow-x: auto;
  text-align: center;
}
.zulip-katex-inner {
  display: inline-block;
  border: 1px solid hsla(187, 35%, 51%, .5);
  border-radius: 3px;
}
/* adjust/override KaTeX-provided CSS */
.zulip-katex-inner .katex-display {
  margin: 0.5em 0.25em;
}
</style>`;

/**
 * Fix KaTeX frac-line elements disappearing.
 *
 * This is a hack, but it's probably better than not having fraction lines on
 * low-resolution phones. It's only known to be useful under Chrome and Android,
 * so we only include it there.
 *
 * See, among others:
 *   https://github.com/KaTeX/KaTeX/issues/824
 *   https://github.com/KaTeX/KaTeX/issues/916
 *   https://github.com/KaTeX/KaTeX/pull/1249
 *   https://github.com/KaTeX/KaTeX/issues/1775
 */
const katexFraclineHackStyle = `<style id="katex-frac-line-hack">
.katex .mfrac .frac-line { border-bottom-width: 1px !important; }
</style>`;

export default (theme: ThemeName) => `
<link rel='stylesheet' type='text/css' href='./base.css'>
<link rel='stylesheet' type='text/css' href='./katex/katex.min.css'>
<style>
${theme === 'night' ? cssNight : ''}
${cssPygments(theme === 'night')}
${cssEmojis}
</style>
<style id="style-hide-js-error-plain">
#js-error-plain, #js-error-plain-dummy {
  display: none;
}
</style>
${katexScrollStyle}
${Platform.OS === 'android' ? katexFraclineHackStyle : '<!-- Safari -->'}
<style id="generated-styles"></style>
`;
