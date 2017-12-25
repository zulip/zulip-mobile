/* @flow */
import {
  MESSAGE_FETCH_COMPLETE,
  WEBVIEW_CLEAR_MESSAGES_FROM,
  WEBVIEW_MARK_AS_READY,
} from '../../actionConstants';

import type { Action } from '../../types';

const initialState = { isReady: true, messages: [] };

export default (state: WebViewState = initialState, action: Action) => {
  switch (action.type) {
    case WEBVIEW_MARK_AS_READY:
      return { ...state, isReady: true };
    case MESSAGE_FETCH_COMPLETE:
      // TODO: check if messages are in active narrow
      // TODO: check for initalFetchComplete or not
      if (action.replaceExisting || !state.isReady) {
        return state;
      }
      return { ...state, messages: [...state.messages, { id: Date.now(), action }] };
    case WEBVIEW_CLEAR_MESSAGES_FROM:
      return { ...state, messages: [] };
    default:
      return state;
  }
};
