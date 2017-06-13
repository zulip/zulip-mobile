/* @flow */
import { StateType, Action } from '../types';
import {
  PUT_DATA,
  REMOVE_DATA,
  EXPAND_STREAM,
  SET_SHARE_STATE,
} from '../actionConstants';

const initialState = {
  shareData: '',
  expandedStreamName: '',
  openShareScreen: false,
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
    case SET_SHARE_STATE:
      return {
        ...state,
        openShareScreen: action.shareState,
      };
    default:
      return state;
  }
};
