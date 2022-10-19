/* @flow strict-local */

/**
 * The topic servers understand to mean "there is no topic".
 *
 * This should match
 *   https://github.com/zulip/zulip/blob/5.0-dev/zerver/lib/actions.py#L2714
 * or similar logic at the latest `main`.
 */
// This is hardcoded in the server, and therefore untranslated; that's
// zulip/zulip#3639.
export const kNoTopicTopic: string = '(no topic)';

/**
 * The notification bot's email address on a typical production server.
 *
 * Helpful for identifying which cross-realm bot is the notification bot, or
 * knowing if a message was sent by the notification bot.
 *
 * Of course, this won't be much use if the server we're dealing with isn't
 * typical and uses a custom value for the email address.
 */
// Copied from
//   https://github.com/zulip/zulip/blob/f6f7e4c53/zproject/default_settings.py#L231 .
// The web app also makes the assumption that Notification Bot has this email:
//   https://github.com/zulip/zulip/blob/eec294b25/static/js/read_receipts.js#L22-L26
// TODO: Make all servers give us a way to identify the notification bot, or
//   at least the messages it sends.  E.g., the mooted "message type" concept:
//   https://chat.zulip.org/#narrow/stream/378-api-design/topic/message.20type.20field/near/1230581
export const kNotificationBotEmail: string = 'notification-bot@zulip.com';
