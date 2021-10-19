/* @flow strict-local */
import type { Stream, ThunkAction } from '../types';
import * as api from '../api';
import { getAuth, getZulipFeatureLevel } from '../selectors';

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
  const state = getState();

  const maybeEncode = (value: string): string =>
    // Adapt to a server API change that was accidentally incompatible:
    //   https://github.com/zulip/zulip-mobile/pull/4748#issuecomment-852254404
    //   https://github.com/zulip/zulip-mobile/issues/4747#issuecomment-946362729
    // TODO(#4659): Ideally this belongs inside `api.updateStream`.
    getZulipFeatureLevel(state) >= 64 ? value : JSON.stringify(value);

  const auth = getAuth(state);
  if (initialValues.name !== newValues.name) {
    await api.updateStream(auth, id, 'new_name', maybeEncode(newValues.name));
  }
  if (initialValues.description !== newValues.description) {
    await api.updateStream(auth, id, 'description', maybeEncode(newValues.description));
  }
  if (initialValues.invite_only !== newValues.isPrivate) {
    await api.updateStream(auth, id, 'is_private', newValues.isPrivate);
  }
};
