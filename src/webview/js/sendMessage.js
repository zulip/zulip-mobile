/* @flow strict-local */
import type { MessageListEvent } from '../webViewEventHandlers';

export default (msg: MessageListEvent) => {
  window.ReactNativeWebView.postMessage(JSON.stringify(msg));
};
