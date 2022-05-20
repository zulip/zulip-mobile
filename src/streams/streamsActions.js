/* @flow strict-local */
import type { Stream, ThunkAction } from '../types';
import * as api from '../api';
import { getAuth, getZulipFeatureLevel } from '../selectors';
import { ensureUnreachable } from '../generics';
import type { SubsetProperties } from '../generics';

export type Privacy = 'public' | 'private';

type StreamPrivacyProps = SubsetProperties<Stream, { +invite_only: mixed, ... }>;

export const streamPropsToPrivacy = (streamProps: StreamPrivacyProps): Privacy =>
  streamProps.invite_only ? 'private' : 'public';

export const privacyToStreamProps = (privacy: Privacy): $Exact<StreamPrivacyProps> => {
  switch (privacy) {
    case 'private':
      return { invite_only: true };
    case 'public':
      return { invite_only: false };
    default:
      ensureUnreachable(privacy);

      // (Unreachable as long as the cases are exhaustive.)
      throw new Error();
  }
};

export const updateExistingStream = (
  id: number,
  initialValues: Stream,
  newData: {| name: string, description: string, privacy: Privacy |},
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
  if (initialValues.name !== newData.name) {
    updates.new_name = maybeEncode(newData.name);
  }
  if (initialValues.description !== newData.description) {
    updates.description = maybeEncode(newData.description);
  }
  const initialPrivacy = streamPropsToPrivacy(initialValues);
  if (initialPrivacy !== newData.privacy) {
    const streamProps = privacyToStreamProps(newData.privacy);

    updates.is_private = streamProps.invite_only;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await api.updateStream(auth, id, updates);
};
