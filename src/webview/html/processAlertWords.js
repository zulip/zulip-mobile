/* @flow strict-local */
import type { FlagsState } from '../../types';

/* eslint-disable */
/*
 * The bulk of this code is taken verbatim from the webapp:
 *   https://github.com/zulip/zulip/blob/9545569dc/static/js/alert_words.js
 * in order to avoid multiple implementations of this rather tricky logic.
 * To permit that, we disable ESLint and Prettier.
 *
 * For an updated comparison, try a command like:
 *   git diff --no-index ../zulip/static/js/alert_words.js src/webview/html/processAlertWords.js
 */

// escape_user_regex taken from jquery-ui/autocomplete.js,
// licensed under MIT license.
// prettier-ignore
function escape_user_regex(value) {
    return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

/* Helper borrowed near-verbatim from webapp; see comment above. */
// prettier-ignore
const process_message = function (words: $ReadOnlyArray<string>,
                                  message: {| alerted: boolean, content: string |}) {
    // Parsing for alert words is expensive, so we rely on the host
    // to tell us there any alert words to even look for.
    if (!message.alerted) {
        return;
    }

    words.forEach(function (word) {
        var clean = escape_user_regex(word);
        var before_punctuation = '\\s|^|>|[\\(\\".,\';\\[]';
        var after_punctuation = '\\s|$|<|[\\)\\"\\?!:.,\';\\]!]';


        var regex = new RegExp('(' + before_punctuation + ')' +
                               '(' + clean + ')' +
                               '(' + after_punctuation + ')', 'ig');
        message.content = message.content.replace(regex, function (match, before, word,
                                                                   after, offset, content) {
            // Logic for ensuring that we don't muck up rendered HTML.
            var pre_match = content.substring(0, offset);
            // We want to find the position of the `<` and `>` only in the
            // match and the string before it. So, don't include the last
            // character of match in `check_string`. This covers the corner
            // case when there is an alert word just before `<` or `>`.
            var check_string = pre_match + match.substring(0, match.length - 1);
            var in_tag = check_string.lastIndexOf('<') > check_string.lastIndexOf('>');
            // Matched word is inside a HTML tag so don't perform any highlighting.
            if (in_tag === true) {
                return before + word + after;
            }
            return before + "<span class='alert-word'>" + word + "</span>" + after;
        });
    });
};

/** Mark any alert words in `content` with an appropriate span. */
export default (
  content: string,
  id: number,
  alertWords: $ReadOnlyArray<string>,
  flags: FlagsState,
): string => {
  // This is kind of funny style, but lets us borrow the webapp's code near
  // verbatim, inside `process_message`.
  let message = { content, alerted: flags.has_alert_word[id] };
  process_message(alertWords, message);
  return message.content;
};
