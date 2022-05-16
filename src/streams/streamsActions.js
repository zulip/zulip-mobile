/* @flow strict-local */
import type { Stream, ThunkAction } from '../types';
import * as api from '../api';
import { getAuth, getZulipFeatureLevel } from '../selectors';
import { ensureUnreachable } from '../generics';
import type { SubsetProperties } from '../generics';

export type Privacy = 'web-public' | 'public' | 'invite-only-public-history' | 'invite-only';

type StreamPrivacyProps = SubsetProperties<
  Stream,
  // If making any optional, read discussion first:
  //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/PATCH.20.2Fstreams.2F.7Bstream_id.7D/near/1383984
  { +is_web_public: mixed, +invite_only: mixed, +history_public_to_subscribers: mixed, ... },
>;

export const streamPropsToPrivacy = (streamProps: StreamPrivacyProps): Privacy => {
  if (streamProps.is_web_public === true) {
    return 'web-public';
  } else if (streamProps.invite_only === false) {
    return 'public';
  } else if (streamProps.history_public_to_subscribers === true) {
    return 'invite-only-public-history';
  } else {
    return 'invite-only';
  }
};

export const privacyToStreamProps = (privacy: Privacy): $Exact<StreamPrivacyProps> => {
  switch (privacy) {
    case 'web-public':
      return { is_web_public: true, invite_only: false, history_public_to_subscribers: true };
    case 'public':
      return { is_web_public: false, invite_only: false, history_public_to_subscribers: true };
    case 'invite-only-public-history':
      return { is_web_public: false, invite_only: true, history_public_to_subscribers: true };
    case 'invite-only':
      return { is_web_public: false, invite_only: true, history_public_to_subscribers: false };
    default:
      ensureUnreachable(privacy);

      // (Unreachable as long as the cases are exhaustive.)
      throw new Error();
  }
};

export const updateExistingStream = (
  id: number,
  changedValues: {| +name?: string, +description?: string, +privacy?: Privacy |},
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
  if (changedValues.name !== undefined) {
    updates.new_name = maybeEncode(changedValues.name);
  }
  if (changedValues.description !== undefined) {
    updates.description = maybeEncode(changedValues.description);
  }
  if (changedValues.privacy !== undefined) {
    const streamProps = privacyToStreamProps(changedValues.privacy);

    // Only send is_web_public if the server will recognize it.
    // TODO(server-5.0): Remove conditional.
    if (getZulipFeatureLevel(state) >= 98) {
      updates.is_web_public = streamProps.is_web_public;
    }
    updates.is_private = streamProps.invite_only;
    updates.history_public_to_subscribers = streamProps.history_public_to_subscribers;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await api.updateStream(auth, id, updates);
};
