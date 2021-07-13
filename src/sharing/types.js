/* @flow strict-local */

export type SharedFile = {|
  name: string,
  mimeType: string,
  url: string,
|};

/**
 * The data we get when the user "shares" to Zulip from another app.
 *
 * On Android, these objects are sent to JS from our platform-native code,
 * constructed there by `getParamsFromIntent` in `SharingHelper.kt`.
 * The correspondence of that code with this type isn't type-checked.
 *
 * (On iOS, we don't currently support this feature in the first place.)
 */
// prettier-ignore
export type SharedData =
  // Note: Keep these in sync with platform-native code.
  | {| type: 'text', sharedText: string |}
  | {| type: 'file', file: SharedFile |};
