/* @flow strict-local */
import type { Action, GlobalState, Dispatch } from './types';
import { ensureTypingStatusExpiryLoop } from './typing/typingActions';
import { EVENT_TYPING_START } from './actionConstants';

export default (dispatch: Dispatch, actions: $ReadOnlyArray<Action>, state: GlobalState) => {
  actions.forEach(action => {
    switch (action.type) {
      case EVENT_TYPING_START:
        dispatch(ensureTypingStatusExpiryLoop());
        break;
      default:
    }
  });
};
