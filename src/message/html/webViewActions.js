/* @flow */
import type { Action } from '../../types';
import { WEBVIEW_CLEAR_MESSAGES_FROM } from '../../actionConstants';

export const clearAllMessagesFromWebView = (): Action => ({
  type: WEBVIEW_CLEAR_MESSAGES_FROM,
});
