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
// eslint-disable-next-line flowtype/type-id-match
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
