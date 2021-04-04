/* @flow strict-local */
import Color from 'color';

export const CONTROL_SIZE = 44;
export const NAVBAR_SIZE = 58;

/* This color is also used directly in several places in our WebView's CSS. */
export const BRAND_COLOR = 'hsl(170, 48%, 54%)';
export const BORDER_COLOR = BRAND_COLOR;
export const HIGHLIGHT_COLOR = Color(BRAND_COLOR)
  .fade(0.5)
  .toString();
export const HALF_COLOR = 'hsla(0, 0%, 50%, 0.5)';
export const QUARTER_COLOR = 'hsla(0, 0%, 50%, 0.25)';
