/* @flow */
import {
  MESSAGE_FETCH_COMPLETE,
  SWITCH_NARROW,
  WEBVIEW_CLEAR_MESSAGES_FROM,
  WEBVIEW_MARK_AS_READY,
} from '../../actionConstants';

import type { Action } from '../../types';

const initialState = { isReady: true, messages: [] };

export default (state: WebViewState = initialState, action: Action) => {
  switch (action.type) {
    default:
      return state;
  }
};
