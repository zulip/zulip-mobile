/* @flow strict-local */
// import { Vibration } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import type { Narrow, ThunkAction } from '../types';
import type { EventAction } from '../actionTypes';
import { EVENT_TYPING_START, EVENT_UPDATE_MESSAGE } from '../actionConstants';
import { ensureTypingStatusExpiryLoop } from '../typing/typingActions';
import * as NavigationService from '../nav/NavigationService';
import {
  isStreamNarrow,
  isTopicNarrow,
  streamIdOfNarrow,
  topicNarrow,
  topicOfNarrow,
} from '../utils/narrow';

/**
 * React to actions dispatched for Zulip server events.
 *
 * To be dispatched before the event actions are dispatched.
 */
export default (action: EventAction): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  switch (action.type) {
    case EVENT_TYPING_START:
      dispatch(ensureTypingStatusExpiryLoop());
      break;

    case EVENT_UPDATE_MESSAGE: {
      // If the conversation we were looking at got moved, follow it.
      // See #5251 for background.

      const { event, move } = action;
      const { propagate_mode } = event;
      if (!move || !(propagate_mode === 'change_all' || propagate_mode === 'change_later')) {
        // This edit wasn't a move, or was targeted to a specific message.
        break;
      }

      const navState = NavigationService.getState();
      for (const route of navState.routes) {
        if (route.name !== 'chat') {
          continue;
        }

        // TODO(#5005): Only make these updates if this ChatScreen is for
        //   the account that this event applies to.  (I.e., just if this is
        //   the active account.)

        // $FlowFixMe[incompatible-use]: relying on ChatScreen having route params
        // $FlowFixMe[incompatible-type]: relying on ChatScreen route-params type
        const narrow: Narrow = route.params.narrow;
        if (
          isTopicNarrow(narrow)
          && streamIdOfNarrow(narrow) === move.orig_stream_id
          && topicOfNarrow(narrow) === move.orig_topic
        ) {
          // A ChatScreen showing the very conversation that was moved.

          // Change the ChatScreen's narrow to follow the move.
          //
          // Web does this only if the blue box is on one of the affected
          // messages, in case only some of the conversation was moved.
          // We don't have a blue box, but:
          // TODO: Ideally if the moved messages are all offscreen we'd skip this.
          NavigationService.dispatch({
            ...CommonActions.setParams({
              narrow: topicNarrow(move.new_stream_id, move.new_topic),
            }),
            // Spreading the `setParams` action and adding `source` like
            // this is the documented way to specify a route (rather than
            // apply to the focused route):
            //   https://reactnavigation.org/docs/5.x/navigation-actions#setparams
            source: route.key,
          });

          // TODO(#5251): If compose box is open and topic was resolved, warn.
        } else if (isStreamNarrow(narrow) && streamIdOfNarrow(narrow) === move.orig_stream_id) {
          // A ChatScreen showing the stream that contained the moved messages.
          //
          // TODO(#5251): Update topic input, if it matches.  (If the stream
          //   changed too, unclear what to do.  Possibly change the
          //   screen's narrow, as if narrowed to the moved topic?)
        }
      }

      break;
    }

    default:
  }
};
