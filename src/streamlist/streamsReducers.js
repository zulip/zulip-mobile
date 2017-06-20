/* @flow */
import { Action, StateType } from '../types';
import {
  INIT_STREAMS,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
  ACCOUNT_SWITCH,
} from '../actionConstants';

const initialState = [];

export default (state: StateType = initialState, action: Action) => {
  switch (action.type) {
    case INIT_STREAMS:
      return action.streams;

    case EVENT_STREAM_ADD:
      return state; // TODO

    case EVENT_STREAM_REMOVE:
      return state; // TODO

    case EVENT_STREAM_UPDATE:
      return state; // TODO

    case ACCOUNT_SWITCH:
      return initialState;

    default:
      return state;
  }
};
