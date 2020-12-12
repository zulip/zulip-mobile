/* @flow strict-local */

/**
 * A user ID.
 *
 * This is a number that identifies a particular Zulip user.  Different
 * users on the same Zulip server will have different user IDs.  On the
 * other hand, between different Zulip servers the same user ID may be used
 * to refer to completely unrelated users.
 *
 * In general, if something calls for a value of this type, then you should
 * be getting it from something that already has this type: like the
 * `user_id` property of a `User` object, or a data structure that stores
 * user IDs.
 *
 * The only other way to create a `UserId` is to call the `makeUserId`
 * function provided by this module.
 *
 * See also type `User`, for the thing that one of these identifies.
 */
// How this type works: it's an "opaque type alias" for simply a number.
// See Flow docs: https://flow.org/en/docs/types/opaque-types/
//
// This means that:
//  * At runtime, a `UserId` value is just a number.  The use of `UserId`
//    involves zero runtime overhead compared with simply `number`.
//  * Because we've written a "bound" of `: number`, all code that has one
//    of these values can freely use it as if it were simply `number`.
//  * On the other hand, the only way to *create* such a value is to invoke
//    something from this module to do it for you.
//
// For more background discussion of opaque types, see `PmKeyRecipients`.
export opaque type UserId: number = number;

/**
 * Take a number, and declare that it truly is a user ID.
 *
 * This does nothing at all at runtime, just returning the value it's
 * passed.  Its only effect is to inform the type-checker that it's OK to
 * use this value where a user ID is required.
 *
 * In general the only legitimate use case for this function, outside of
 * tests, is when parsing a user ID from a string.  When getting a user ID
 * from any other source, if the values really are user IDs then the type of
 * that source should be adjusted to say so.
 */
export const makeUserId = (id: number): UserId => id;

/* Possible future work:
    export opaque type StreamId: number = number;
    export opaque type MessageId: number = number;
    export const makeStreamId = (id: number): StreamId => id;
    export const makeMessageId = (id: number): MessageId => id;
*/
