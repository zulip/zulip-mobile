/* @flow strict-local */
import type { WebViewOutboundEvent } from '../handleOutboundEvents';

export default (msg: WebViewOutboundEvent) => {
  window.ReactNativeWebView.postMessage(JSON.stringify(msg));
};
