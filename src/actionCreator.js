/* @flow strict-local */
import type { Action, GlobalState, Dispatch } from './types';
import { clearTypingNotification } from './typing/clearTypingNotification';
import { EVENT_TYPING_START } from './actionConstants';

export default (dispatch: Dispatch, actions: $ReadOnlyArray<Action>, state: GlobalState) => {
  actions.forEach(action => {
    switch (action.type) {
      case EVENT_TYPING_START:
        if (Object.keys(state.typing).length === 0) {
          dispatch(clearTypingNotification());
        }
        break;
      default:
    }
  });
};
