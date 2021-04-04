/* @flow strict-local */
import Color from 'color';

export const CONTROL_SIZE = 44;
export const NAVBAR_SIZE = 58;

/* This color is also used directly in several places in our WebView's CSS. */
/* The BRAND_COLOR is set based on a report by Anders Kaseorg which says that
   rgb(100, 146, 253.5) is the sRGB midpoint of our logo's gradient. Refer to:
   https://github.com/zulip/zulip-mobile/pull/4467#issue-567898180 */
export const BRAND_COLOR = 'hsl(222, 99%, 69%)';
export const BORDER_COLOR = BRAND_COLOR;
export const HIGHLIGHT_COLOR = Color(BRAND_COLOR)
  .fade(0.5)
  .toString();
export const HALF_COLOR = 'hsla(0, 0%, 50%, 0.5)';
export const QUARTER_COLOR = 'hsla(0, 0%, 50%, 0.25)';
