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
