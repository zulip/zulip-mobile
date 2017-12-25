/* @flow */
import type { Action } from '../../types';
import { WEBVIEW_CLEAR_MESSAGES_FROM, WEBVIEW_MARK_AS_READY } from '../../actionConstants';

export const clearAllMessagesFromWebView = (): Action => ({
  type: WEBVIEW_CLEAR_MESSAGES_FROM,
});

export const markWebViewAsReady = (): Action => ({
  type: WEBVIEW_MARK_AS_READY,
});
