/* @flow */
import type { Action } from '../../types';
import {
  WEBVIEW_CLEAR_MESSAGES_FROM,
  WEBVIEW_CLEAR_ALL_UPDATE_MESSAGES,
} from '../../actionConstants';

export const clearAllMessagesFromWebView = (): Action => ({
  type: WEBVIEW_CLEAR_MESSAGES_FROM,
});

export const clearAllUpdateMessagesFromWebView = (): Action => ({
  type: WEBVIEW_CLEAR_ALL_UPDATE_MESSAGES,
});
