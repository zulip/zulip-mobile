/* @flow strict-local */
/* eslint-disable */
/*
 * The corresponding code in front-end is here:
 * https://github.com/zulip/zulip/blob/8aee6a1dd/static/js/message_list_view.js
 *
 * This implements the exact strict matching as this function but produces
 * slightly different result (for simpler formatting later) 
 */

export default (content: string): string =>
  content.replace(/^<p>\/me (.+)<\/p>$/, '<span class="message-me">$1</span>');
