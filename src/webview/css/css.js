/* @flow strict-local */
import { Platform } from 'react-native';
import type { ThemeName } from '../../types';
import cssPygments from './cssPygments';
import cssEmojis from './cssEmojis';
import cssNight from './cssNight';

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

export default (theme: ThemeName): string => `
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
${Platform.OS === 'android' ? katexFraclineHackStyle : '<!-- Safari -->'}
<style id="generated-styles"></style>
`;
