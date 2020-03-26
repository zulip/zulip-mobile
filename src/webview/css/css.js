/* @flow strict-local */
import type { ThemeName } from '../../types';
import cssPygments from './cssPygments';
import cssEmojis from './cssEmojis';
import cssNight from './cssNight';

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
<style id="generated-styles"></style>
`;
