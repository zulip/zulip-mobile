/* @flow strict-local */
import { Platform } from 'react-native';

import type { Auth } from '../../types';
import smoothScroll from './smoothScroll.min';
import matchesPolyfill from './matchesPolyfill';
import compiledWebviewJs from './generatedEs3';

/**
 * An HTML fragment for the main `script` element for our message-list WebView.
 */
// The bulk of the code in this `script` element comes from
// `compiledWebviewJs`, which in turn is derived from `js.js`
// and its imports.  See module jsdoc on `js.js`.
export default (
  scrollMessageId: number | null,
  auth: Auth,
  doNotMarkMessagesAsRead: boolean,
): string => `
<script>
window.__forceSmoothScrollPolyfill__ = true;
${smoothScroll}
${matchesPolyfill}
window.isDevelopment = ${(process.env.NODE_ENV === 'development').toString()};
document.addEventListener('DOMContentLoaded', function() {
  var platformOS = ${JSON.stringify(Platform.OS)};
  var doNotMarkMessagesAsRead = ${JSON.stringify(doNotMarkMessagesAsRead)};
  ${compiledWebviewJs}
  compiledWebviewJs.handleInitialLoad(
    ${JSON.stringify(scrollMessageId)},
    ${JSON.stringify(auth)}
  );
});
</script>
`;
