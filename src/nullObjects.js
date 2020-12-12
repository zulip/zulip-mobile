/* @flow strict-local */
import type { Subscription } from './types';

export const NULL_OBJECT = Object.freeze({});

export const NULL_ARRAY = Object.freeze([]);

/*
 * All the below objects are DEPRECATED; rather than using one, choose the
 * appropriate fallback behavior explicitly.  See 25125db94 for more
 * discussion.
 *
 * Further changes to eliminate the remaining uses of these would be great.
 *
 * For examples of explicit fallback behavior, see:
 *
 *  * Selector `getActiveAccount` -- throw an error.  Good when missing data
 *    is a bug and the caller can't reasonably do without it.  This is the
 *    right thing for most callers of most selectors.
 *
 *  * Selectors `tryGetActiveAccount` and `tryGetAuth` -- return undefined,
 *    and reflect that in the type.  Caller then gets to decide what to do;
 *    see callsites of `tryGetAuth`.
 *
 *  * Commit 7829bef43 -- simple cases showing a couple of different
 *    fallbacks.
 *
 *  * Commit e22596c24 -- throwing an error, in a case that required some
 *    more work to decide that was the right thing.
 */

/** DEPRECATED; don't add new uses.  See block comment above definition. */
export const NULL_SUBSCRIPTION: Subscription = {
  audible_notifications: false,
  color: 'gray',
  description: '',
  desktop_notifications: false,
  email_address: '',
  in_home_view: false,
  invite_only: false,
  name: '',
  pin_to_top: false,
  stream_id: 0,
  stream_weekly_traffic: 0,
  push_notifications: false,
  is_old_stream: false,
  is_announcement_only: false,
  history_public_to_subscribers: false,
};
