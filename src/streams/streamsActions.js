/* @flow */
import type { GetState, Dispatch, Stream, InitStreamsAction } from '../types';
import { createStream, updateStream, getStreams, toggleMuteStream, togglePinStream } from '../api';
import { INIT_STREAMS } from '../actionConstants';
import { getActiveAccount } from '../selectors';

export const initStreams = (streams: Stream[]): InitStreamsAction => ({
  type: INIT_STREAMS,
  streams,
});

export const fetchStreams = () => async (dispatch: Dispatch, getState: GetState) =>
  dispatch(initStreams(await getStreams(getActiveAccount(getState()))));

export const createNewStream = (
  name: string,
  description: string,
  principals: string[],
  isPrivate: boolean,
) => async (dispatch: Dispatch, getState: GetState) => {
  await createStream(getActiveAccount(getState()), name, description, principals, isPrivate);
};

export const updateExistingStream = (
  id: number,
  initialValues: Object,
  newValues: Object,
) => async (dispatch: Dispatch, getState: GetState) => {
  if (initialValues.name !== newValues.name) {
    // Stream names might contain unsafe characters so we must encode it first.
    await updateStream(
      getActiveAccount(getState()),
      id,
      'new_name',
      JSON.stringify(newValues.name),
    );
  }
  if (initialValues.description !== newValues.description) {
    // Description might contain unsafe characters so we must encode it first.
    await updateStream(
      getActiveAccount(getState()),
      id,
      'description',
      JSON.stringify(newValues.description),
    );
  }
  if (initialValues.invite_only !== newValues.isPrivate) {
    await updateStream(getActiveAccount(getState()), id, 'is_private', newValues.isPrivate);
  }
};

export const doTogglePinStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await togglePinStream(getActiveAccount(getState()), streamId, value);
};

export const doToggleMuteStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await toggleMuteStream(getActiveAccount(getState()), streamId, value);
};
