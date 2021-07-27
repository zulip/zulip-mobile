/* @flow strict-local */
import type { Stream, ThunkAction } from '../types';
import * as api from '../api';
import { getAuth } from '../selectors';

export const createNewStream = (
  name: string,
  description: string,
  principals: string[],
  isPrivate: boolean,
): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  await api.createStream(getAuth(getState()), name, description, principals, isPrivate);
};

export const updateExistingStream = (
  id: number,
  initialValues: Stream,
  newValues: {| name: string, description: string, isPrivate: boolean |},
): ThunkAction<Promise<void>> => async (dispatch, getState) => {
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
};
