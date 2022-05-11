/* @flow strict-local */
import { EventTypes } from '../api/eventTypes';
import type { PerAccountApplicableAction, StreamsState, StreamUpdateEvent } from '../types';
import type { Stream, Subscription } from '../api/modelTypes';
import { ensureUnreachable } from '../types';
import { LOGOUT, ACCOUNT_SWITCH, EVENT, REGISTER_COMPLETE } from '../actionConstants';
import { NULL_ARRAY } from '../nullObjects';
import { filterArray } from '../utils/immutability';

const initialState: StreamsState = NULL_ARRAY;

export function updateStreamProperties<S: Stream | Subscription>(
  stream: S,
  event: StreamUpdateEvent,
): S {
  switch (event.property) {
    case ('name': 'name'):
      return { ...stream, [event.property]: event.value };
    case ('description': 'description'):
      return {
        ...stream,
        [event.property]: event.value,
        rendered_description: event.rendered_description,
      };
    case ('date_created': 'date_created'):
      return { ...stream, [event.property]: event.value };
    case ('invite_only': 'invite_only'):
      return {
        ...stream,
        [event.property]: event.value,
        history_public_to_subscribers: event.history_public_to_subscribers,
        is_web_public: event.is_web_public,
      };
    case ('rendered_description': 'rendered_description'):
      return { ...stream, [event.property]: event.value };
    case ('is_web_public': 'is_web_public'):
      return { ...stream, [event.property]: event.value };
    case ('stream_post_policy': 'stream_post_policy'):
      return { ...stream, [event.property]: event.value };
    case ('message_retention_days': 'message_retention_days'):
      return { ...stream, [event.property]: event.value };
    case ('history_public_to_subscribers': 'history_public_to_subscribers'):
      return { ...stream, [event.property]: event.value };
    case ('first_message_id': 'first_message_id'):
      return { ...stream, [event.property]: event.value };
    case ('is_announcement_only': 'is_announcement_only'):
      return { ...stream, [event.property]: event.value };
    default:
      ensureUnreachable(event.property);
      return stream;
  }
}

export default (
  state: StreamsState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
): StreamsState => {
  switch (action.type) {
    case REGISTER_COMPLETE:
      return action.data.streams || initialState;

    case LOGOUT:
    case ACCOUNT_SWITCH:
      return initialState;

    case EVENT: {
      const { event } = action;
      switch (event.type) {
        case EventTypes.stream:
          switch (event.op) {
            case 'create':
              return state.concat(
                event.streams.filter(x => !state.find(y => x.stream_id === y.stream_id)),
              );

            case 'delete':
              return filterArray(
                state,
                x => !event.streams.find(y => x && x.stream_id === y.stream_id),
              );

            case 'update':
              return state.map(stream => {
                if (stream.stream_id !== event.stream_id) {
                  return stream;
                }

                return updateStreamProperties(stream, event);
              });

            case 'occupy':
            case 'vacate':
              return state;

            default:
              ensureUnreachable(event);
              return state;
          }
        default:
          return state;
      }
    }
    default:
      return state;
  }
};
