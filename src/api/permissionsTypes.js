/* @flow strict-local */

import { typesEquivalent } from '../generics';
import { objectValues } from '../flowPonyfill';

/**
 * Organization-level role of a user.
 */
// Ideally both the type and enum would have the simple name; but a type
// and value sharing a name is one nice TS feature that Flow lacks.
// Or we could leapfrog TS and make this a Flow enum:
//   https://flow.org/en/docs/enums/
// (TS has its own enums, but they are a mess.)
// eslint-disable-next-line ft-flow/type-id-match
export type RoleT = 100 | 200 | 300 | 400 | 600;

/**
 * An enum of all valid values for `RoleT`.
 *
 * Described in the server API doc, e.g., at `.role` in `realm_users` at
 *   https://zulip.com/api/register-queue
 *
 * See RoleValues for the list of values.
 */
export const Role = {
  Owner: (100: 100),
  Admin: (200: 200),
  Moderator: (300: 300),
  Member: (400: 400),
  Guest: (600: 600),
};

// Check that the enum indeed has all and exactly the values of the type.
typesEquivalent<RoleT, $Values<typeof Role>>();

/**
 * A list of all valid values for `RoleT`.
 *
 * See Role for an enum to refer to these by meaningful names.
 */
export const RoleValues: $ReadOnlyArray<RoleT> = objectValues(Role);

/**
 * This organization's policy for which users can create public streams, or
 *   its policy for which users can create private streams.
 *
 * (These policies could be set differently, but their types are the same,
 * so it's convenient to have just one definition.)
 *
 * For the policy for web-public streams, see CreateWebPublicStreamPolicy.
 */
// eslint-disable-next-line ft-flow/type-id-match
export type CreatePublicOrPrivateStreamPolicyT = 1 | 2 | 3 | 4;

/**
 * An enum of all valid values for `CreatePublicOrPrivateStreamPolicyT`.
 *
 * See CreatePublicOrPrivateStreamPolicyValues for the list of values.
 */
// Ideally both the type and enum would have the simple name; but a type
// and value sharing a name is one nice TS feature that Flow lacks.
// Or we could leapfrog TS and make this a Flow enum:
//   https://flow.org/en/docs/enums/
// (TS has its own enums, but they are a mess.)
export const CreatePublicOrPrivateStreamPolicy = {
  MemberOrAbove: (1: 1),
  AdminOrAbove: (2: 2),
  FullMemberOrAbove: (3: 3),
  ModeratorOrAbove: (4: 4),
};

// Check that the enum indeed has all and exactly the values of the type.
typesEquivalent<
  CreatePublicOrPrivateStreamPolicyT,
  $Values<typeof CreatePublicOrPrivateStreamPolicy>,
>();

/**
 * A list of all valid values for `CreatePublicOrPrivateStreamPolicyT`.
 *
 * See CreatePublicOrPrivateStreamPolicy for an enum to refer to these by
 * meaningful names.
 */
export const CreatePublicOrPrivateStreamPolicyValues: $ReadOnlyArray<CreatePublicOrPrivateStreamPolicyT> =
  objectValues(CreatePublicOrPrivateStreamPolicy);

/**
 * The policy for which users can create web public streams in this
 * organization. Ignore if the server hasn't opted into the concept of
 * web-public streams.
 */
export enum CreateWebPublicStreamPolicy {
  AdminOrAbove = 2,
  ModeratorOrAbove = 4,
  Nobody = 6,
  OwnerOnly = 7,
}
