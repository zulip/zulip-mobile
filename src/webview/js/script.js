/* @flow */
import config from '../../config';
import { getWebviewResource } from '../webviewHelpers';

export default (anchor: number): string => `
<script src="${getWebviewResource('smooth-scroll.js')}"></script>
<script src="${getWebviewResource('matches-polyfill.js')}"></script>
<script src="${getWebviewResource('zulip.js')}"></script>
<script>
window.__forceSmoothScrollPolyfill__ = true;
window.enableWebViewErrorDisplay = ${config.enableWebViewErrorDisplay.toString()};
scrollToAnchor(${anchor});
scrollEventsDisabled = false;
sendScrollMessageIfListShort();
</script>
`;
