/* @flow strict-local */
import type { GetState, Dispatch, Stream } from '../types';
import { createStream, updateStream, toggleMuteStream, togglePinStream } from '../api';
import { getAuth } from '../selectors';

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
  initialValues: Stream,
  newValues: {| name: string, description: string, isPrivate: boolean |},
) => async (dispatch: Dispatch, getState: GetState) => {
  if (initialValues.name !== newValues.name) {
    // Stream names might contain unsafe characters so we must encode it first.
    await updateStream(getAuth(getState()), id, 'new_name', JSON.stringify(newValues.name));
  }
  if (initialValues.description !== newValues.description) {
    // Description might contain unsafe characters so we must encode it first.
    await updateStream(
      getAuth(getState()),
      id,
      'description',
      JSON.stringify(newValues.description),
    );
  }
  if (initialValues.invite_only !== newValues.isPrivate) {
    await updateStream(getAuth(getState()), id, 'is_private', newValues.isPrivate);
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
