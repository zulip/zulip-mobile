/* @flow */
import { StateType, Action } from '../types';
import {
  PUT_DATA,
  REMOVE_DATA,
} from '../actionConstants';

const initialState = {
  shareData: 'initialState',
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
    default:
      return state;
  }
};
