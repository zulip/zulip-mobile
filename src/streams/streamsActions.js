/* @flow strict-local */
import type { GetState, Dispatch, Stream } from '../types';
import * as api from '../api';
import { getAuth } from '../selectors';

export const createNewStream = (
  name: string,
  description: string,
  principals: string[],
  isPrivate: boolean,
) => async (dispatch: Dispatch, getState: GetState) => {
  await api.createStream(getAuth(getState()), name, description, principals, isPrivate);
};

export const updateExistingStream = (
  id: number,
  initialValues: Stream,
  newValues: {| name: string, description: string, isPrivate: boolean |},
) => async (dispatch: Dispatch, getState: GetState) => {
  if (initialValues.name !== newValues.name) {
    await api.updateStream(getAuth(getState()), id, 'new_name', newValues.name);
  }
  if (initialValues.description !== newValues.description) {
    await api.updateStream(getAuth(getState()), id, 'description', newValues.description);
  }
  if (initialValues.invite_only !== newValues.isPrivate) {
    await api.updateStream(getAuth(getState()), id, 'is_private', newValues.isPrivate);
  }
};
