/* @flow strict-local */
// $FlowFixMe[untyped-import]
import Color from 'color';

export const CONTROL_SIZE = 44;
export const NAVBAR_SIZE = 58;

// The value `hsl(222, 99%, 69%)` is chosen to match `rgb(100, 146, 253.5)`,
// which is the sRGB midpoint of the Zulip logo's gradient.
//
// Note this color is also used directly in several other places:
//  * in our WebView's CSS;
//  * under `android/` (search for "BRAND_COLOR");
//  * in `ios/**/Brand.colorset/Contents.json`.
export const BRAND_COLOR = 'hsl(222, 99%, 69%)';
export const BORDER_COLOR = BRAND_COLOR;
export const HIGHLIGHT_COLOR: string = Color(BRAND_COLOR).fade(0.5).toString();

export const HALF_COLOR = 'hsla(0, 0%, 50%, 0.5)';
export const QUARTER_COLOR = 'hsla(0, 0%, 50%, 0.25)';
