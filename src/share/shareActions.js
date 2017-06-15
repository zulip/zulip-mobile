/* @flow */
import {
  PUT_DATA,
  REMOVE_DATA,
  EXPAND_STREAM,
  SET_SHARE_STATE,
} from '../actionConstants';

export const putData = (data: string) => ({
  type: PUT_DATA,
  data,
});

export const removeData = () => ({
  type: REMOVE_DATA,
});

export const expandStream = (streamName: string) => ({
  type: EXPAND_STREAM,
  streamName,
});

export const setShareState = (shareState: boolean) => ({
  type: SET_SHARE_STATE,
  shareState,
});
