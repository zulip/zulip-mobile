/* @flow strict-local */
import template from './template';
import type { Auth, ThemeName } from '../../types';
import css from '../css/css';
import script from '../js/script';

type InitOptionsType = {|
  scrollMessageId: number | null,
  auth: Auth,
|};

/**
 * Workaround for a WebKit CSS transitions bug affecting both iOS and Android.
 *
 * The timestamp pills (and possibly other elements) have CSS transitions
 * defined for properties whose values are different from the default user-agent
 * specified values.
 *
 * When the relevant CSS rules were moved into a separate file in commit
 * 8fdb93b, this triggered the bug: the WebView started initially using its
 * default values, and only switching to the stylesheet-specified values once
 * they were loaded. Since this switch included the addition of transition rules,
 * the WebView applied the transition. This led to all the timestamp pills
 * starting (visually) in the flyout state.
 *
 * There are many possible fixes to this, including:
 *  - reworking the transitions such that their start states are all equivalent
 *    to `initial`;
 *  - moving (at least) the CSS rules with transitions into inline stylesheets
 *    within the generated HTML; and/or
 *  - the following bizarre, but minimally intrusive, hack.
 *
 *
 * See:
 *  - https://bugs.chromium.org/p/chromium/issues/detail?id=167083
 *  - https://bugs.chromium.org/p/chromium/issues/detail?id=332189
 */
const webkitBugWorkaround: string = '<script> </script>';

/**
 * A utility to generate the HTML for our webviews.
 *
 * Injects scripts, styles and meta tags along with the content to be rendered.
 *
 * @param theme The theme (default/night) of the webview.
 * @param initOptions Data about the auth and initial scroll position.
 * @param htmlBody The dynamic HTML content that is to be rendered in the webview.
 */
export default (theme: ThemeName, initOptions: InitOptionsType, htmlBody: string) => template`
$!${script(initOptions.scrollMessageId, initOptions.auth)}
$!${css(theme)}

<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<body style="overflow-x: hidden;">
$!${htmlBody}
$!${webkitBugWorkaround}
</body>
`;
