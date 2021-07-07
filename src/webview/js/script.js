/* @flow strict-local */
import { Platform } from 'react-native';

import type { Auth } from '../../types';
import smoothScroll from './smoothScroll.min';
import matchesPolyfill from './matchesPolyfill';
import compiledWebviewJs from './generatedEs3';
import config from '../../config';

export default (
  scrollMessageId: number | null,
  auth: Auth,
  doNotMarkMessagesAsRead: boolean,
): string => `
<script>
window.__forceSmoothScrollPolyfill__ = true;
${smoothScroll}
${matchesPolyfill}
window.enableWebViewErrorDisplay = ${config.enableWebViewErrorDisplay.toString()};
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
