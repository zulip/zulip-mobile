/* @flow strict-local */

import type { Identity } from '../types';
import type {
  PmMessage,
  StreamMessage,
  Message,
  MessageEdit,
  Reaction,
  UserId,
} from './modelTypes';
import { AvatarURL } from '../utils/avatar';

/**
 * The variant of `Reaction` found in a fetch-message(s) response.
 *
 * Note that reaction events have a *different* variation; see their
 * handling in `eventToAction`.
 */
// We shouldn't have to rely on this format on servers at feature
// level 2+; those newer servers include a top-level `user_id` field
// in addition to the `user` object. See #4072.
// TODO(server-3.0): Simplify this away.
export type FetchedReaction = $ReadOnly<{|
  ...$Diff<Reaction, {| user_id: mixed |}>,
  user: $ReadOnly<{|
    email: string,
    full_name: string,
    id: UserId,
  |}>,
|}>;

/**
 * The elements of Message.edit_history found in a fetch-message(s) response.
 *
 * Accurate for supported servers before and after FL 118. For convenience,
 * we drop objects of this type if the FL is <118, so that the modern shape
 * at Message.edit_history is the only shape we store in Redux; see there.
 */
// TODO(server-5.0): Simplify this away.
export type FetchedMessageEdit = $ReadOnly<{|
  prev_content?: string,
  prev_rendered_content?: string,
  prev_rendered_content_version?: number,
  prev_stream?: number,
  prev_topic?: string, // New in FL 118, replacing `prev_subject`.
  prev_subject?: string, // Replaced in FL 118 by `prev_topic`.
  stream?: number, // New in FL 118.
  timestamp: number,
  topic?: string, // New in FL 118.
  user_id: UserId | null,
|}>;

// How `FetchedMessage` relates to `Message`, in a way that applies
// uniformly to `Message`'s subtypes.
type FetchedMessageOf<M: Message> = $ReadOnly<{|
  ...$Exact<M>,
  avatar_url: string | null,
  reactions: $ReadOnlyArray<FetchedReaction>,

  // Unlike Message['edit_history'], this can't be `null`.
  edit_history?: $ReadOnlyArray<FetchedMessageEdit>,
|}>;

export type FetchedMessage = FetchedMessageOf<PmMessage> | FetchedMessageOf<StreamMessage>;

/**
 * Make a `Message` from `GET /messages` or `GET /message/{message_id}`
 */
export const transformFetchedMessage = <M: Message>(
  message: FetchedMessageOf<M>,
  identity: Identity,
  zulipFeatureLevel: number,
  allowEditHistory: boolean,
): M => ({
  ...message,
  avatar_url: AvatarURL.fromUserOrBotData({
    rawAvatarUrl: message.avatar_url,
    email: message.sender_email,
    userId: message.sender_id,
    realm: identity.realm,
  }),
  reactions: message.reactions.map(reaction => {
    const { user, ...restReaction } = reaction;
    return {
      ...restReaction,
      user_id: user.id,
    };
  }),

  // Why condition on allowEditHistory? See MessageBase['edit_history'].
  // Why FL 118 condition? See MessageEdit type.
  edit_history:
    /* eslint-disable operator-linebreak */
    allowEditHistory && zulipFeatureLevel >= 118
      ? // $FlowIgnore[incompatible-cast] - See MessageEdit type
        (message.edit_history: $ReadOnlyArray<MessageEdit> | void)
      : null,
});
