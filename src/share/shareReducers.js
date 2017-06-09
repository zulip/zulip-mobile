/* @flow */
import { StateType, Action } from '../types';
import {
  PUT_DATA,
  REMOVE_DATA,
  EXPAND_STREAM,
} from '../actionConstants';

const initialState = {
  shareData: '',
  expandedStreamName: '',
};

export default (state: StateType = initialState, action:Action) => {
  switch (action.type) {
    case PUT_DATA:
      return {
        ...state,
        shareData: action.data,
      };
    case REMOVE_DATA:
      return {
        ...state,
        shareData: '',
      };
    case EXPAND_STREAM:
      return {
        ...state,
        expandedStreamName: action.streamName,
      };
    default:
      return state;
  }
};
