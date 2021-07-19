/* @flow strict-local */

/**
 * The data we get when the user "shares" to Zulip from another app.
 *
 * On Android, these objects are sent to JS from our platform-native code,
 * constructed there by `getParamsFromIntent` in `SharingHelper.kt`.
 * The correspondence of that code with this type isn't type-checked.
 *
 * Note: Keep in sync with platform-native code.
 */
export type SharedData =
  | {| type: 'text', sharedText: string |}
  | {| type: 'image', sharedImageUrl: string, fileName: string |}
  | {| type: 'file', sharedFileUrl: string, fileName: string |};
