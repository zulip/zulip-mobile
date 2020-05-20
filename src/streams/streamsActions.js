/* @flow strict-local */
import type { GetState, Dispatch, Stream, StreamPostPolicy } from '../types';
import * as api from '../api';
import { getAuth } from '../selectors';

export const createNewStream = (
  name: string,
  description: string,
  principals: string[],
  isPrivate: boolean,
  streamPostPolicy: StreamPostPolicy,
) => async (dispatch: Dispatch, getState: GetState) => {
  await api.createStream(
    getAuth(getState()),
    name,
    description,
    principals,
    isPrivate,
    streamPostPolicy,
  );
};

export const updateExistingStream = (
  id: number,
  initialValues: Stream,
  newValues: {|
    name: string,
    description: string,
    isPrivate: boolean,
    streamPostPolicy: StreamPostPolicy,
  |},
) => async (dispatch: Dispatch, getState: GetState) => {
  if (initialValues.name !== newValues.name) {
    // Stream names might contain unsafe characters so we must encode it first.
    await api.updateStream(getAuth(getState()), id, 'new_name', JSON.stringify(newValues.name));
  }
  if (initialValues.description !== newValues.description) {
    // Description might contain unsafe characters so we must encode it first.
    await api.updateStream(
      getAuth(getState()),
      id,
      'description',
      JSON.stringify(newValues.description),
    );
  }
  if (initialValues.invite_only !== newValues.isPrivate) {
    await api.updateStream(getAuth(getState()), id, 'is_private', newValues.isPrivate);
  }

  if (initialValues.stream_post_policy !== newValues.streamPostPolicy) {
    await api.updateStream(
      getAuth(getState()),
      id,
      'stream_post_policy',
      newValues.streamPostPolicy,
    );
  }
};

export const togglePinStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await api.togglePinStream(getAuth(getState()), streamId, value);
};

export const toggleMuteStream = (streamId: number, value: boolean) => async (
  dispatch: Dispatch,
  getState: GetState,
) => {
  await api.toggleMuteStream(getAuth(getState()), streamId, value);
};
