/* @flow strict-local */
import type { Stream, ThunkAction } from '../types';
import * as api from '../api';
import { getAuth, getZulipFeatureLevel } from '../selectors';

export const updateExistingStream = (
  id: number,
  initialValues: Stream,
  newValues: {|
    name: string,
    description: string,
    invite_only: boolean,
    is_web_public: boolean,
    history_public_to_subscribers: boolean,
  |},
): ThunkAction<Promise<void>> => async (dispatch, getState) => {
  const state = getState();

  const maybeEncode = (value: string): string =>
    // Adapt to a server API change that was accidentally incompatible:
    //   https://github.com/zulip/zulip-mobile/pull/4748#issuecomment-852254404
    //   https://github.com/zulip/zulip-mobile/issues/4747#issuecomment-946362729
    // TODO(#4659): Ideally this belongs inside `api.updateStream`.
    // TODO(server-4.0): Simplify this (if it hasn't already moved.)
    getZulipFeatureLevel(state) >= 64 ? value : JSON.stringify(value);

  const auth = getAuth(state);
  const updates = {};
  if (initialValues.name !== newValues.name) {
    updates.new_name = maybeEncode(newValues.name);
  }
  if (initialValues.description !== newValues.description) {
    updates.description = maybeEncode(newValues.description);
  }

  // The values of invite_only, is_web_public, and history_public_to_subscribers are
  // not independent. The API will enforce that certain combinations are not
  // set. Because of this, if any of these values have changed we set all of them.
  const policyHasChanged =
    initialValues.invite_only !== newValues.invite_only
    || initialValues.is_web_public !== newValues.is_web_public
    || initialValues.history_public_to_subscribers !== newValues.history_public_to_subscribers;
  if (policyHasChanged) {
    updates.is_private = newValues.invite_only;
    updates.is_web_public = newValues.is_web_public;
    updates.history_public_to_subscribers = newValues.history_public_to_subscribers;
  }

  if (Object.keys(updates).length > 0) {
    await api.updateStream(auth, id, updates);
  }
};
