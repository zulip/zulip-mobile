/* @flow */
import type { GetState, Dispatch, Stream, InitStreamsAction } from '../types';
import { createStream, updateStream, toggleMuteStream, togglePinStream } from '../api';
import { INIT_STREAMS } from '../actionConstants';
import { getAuth } from '../selectors';
import { getChangedValues } from '../utils/misc';

export const initStreams = (streams: Stream[]): InitStreamsAction => ({
  type: INIT_STREAMS,
  streams,
});

export const createNewStream = (
  name: string,
  description: string,
  principals: string[],
  isPrivate: boolean,
) => async (dispatch: Dispatch, getState: GetState) => {
  await createStream(getAuth(getState()), name, description, principals, isPrivate);
};

export const updateExistingStream = (
  id: number,
  initialValues: Object,
  newValues: Object,
) => async (dispatch: Dispatch, getState: GetState) => {
  // strings might contain unsafe characters so we must encode it first.
  const newData = {
    new_name: JSON.stringify(newValues.name),
    description: JSON.stringify(newValues.description),
    is_private: newValues.is_private,
  };
  const oldData = {
    new_name: JSON.stringify(initialValues.name),
    description: JSON.stringify(initialValues.description),
    is_private: initialValues.is_private,
  };
  const apiParams = getChangedValues(newData, oldData);
  if (Object.keys(apiParams).length > 0) {
    await updateStream(getAuth(getState()), id, apiParams);
  }
};

export const doTogglePinStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await togglePinStream(getAuth(getState()), streamId, value);
};

export const doToggleMuteStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await toggleMuteStream(getAuth(getState()), streamId, value);
};
