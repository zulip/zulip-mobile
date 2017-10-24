/* @flow */
import { DeviceState, Action } from '../types';
import { INIT_SAFE_AREA_INSETS } from '../actionConstants';

const initialState: DeviceState = {
  safeAreaInsets: undefined,
};

export default (state: DeviceState = initialState, action: Action) => {
  switch (action.type) {
    case INIT_SAFE_AREA_INSETS:
      return {
        ...state,
        safeAreaInsets: action.safeAreaInsets,
      };

    default:
      return state;
  }
};
