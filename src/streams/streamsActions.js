/* @flow */
import type { GetState, Actions, Dispatch } from '../types';
import { createStream, updateStream, getStreams, togglePinStream } from '../api';
import { INIT_STREAMS } from '../actionConstants';
import { getAuth } from '../selectors';

export const initStreams = (streams: any[]): Actions => ({
  type: INIT_STREAMS,
  streams,
});

export const fetchStreams = (): Actions => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initStreams(await getStreams(getAuth(getState()))));

export const createNewStream = (
  name: string,
  description: string,
  principals: string[],
  isPrivate: boolean,
): Actions => async (dispatch: Dispatch, getState: GetState) => {
  await createStream(getAuth(getState()), name, description, principals, isPrivate);
};

export const updateExistingStream = (
  id: number,
  initialValues: Object,
  newValues: Object,
): Actions => async (dispatch: Dispatch, getState: GetState) => {
  if (initialValues.name !== newValues.name) {
    await updateStream(getAuth(getState()), id, 'name', newValues.name);
  }
  if (initialValues.description !== newValues.description) {
    await updateStream(getAuth(getState()), id, 'description', newValues.description);
  }
  if (initialValues.invite_only !== newValues.isPrivate) {
    await updateStream(getAuth(getState()), id, 'is_private', newValues.isPrivate);
  }
};

export const doTogglePinStream = (streamId: number, value: boolean): Actions => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await togglePinStream(getAuth(getState()), streamId, value);
};
