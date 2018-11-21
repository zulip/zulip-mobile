/* @flow */
import type { Account } from '../../types';
import smoothScroll from './smoothScroll.min';
import matchesPolyfill from './matchesPolyfill';
import js from './generatedEs3';
import config from '../../config';

export default (anchor: number, account: Account): string => `
<script>
window.__forceSmoothScrollPolyfill__ = true;
${smoothScroll}
${matchesPolyfill}
window.enableWebViewErrorDisplay = ${config.enableWebViewErrorDisplay.toString()};
document.addEventListener('DOMContentLoaded', function() {
  ${js}
  handleInitialLoad(${anchor}, ${JSON.stringify(account)});
});
</script>
`;
