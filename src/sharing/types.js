/* @flow strict-local */

/**
 * The data we need in JS/React code representing shared content.
 *
 * On Android, these objects are sent to JS from our platform-native code,
 * constructed there by `getParamsFromIntent` in `SharingHelper.kt`.
 * The correspondence of that code with this type isn't type-checked.
 *
 * Note: Keep in sync with platform-native code.
 */
type SharedText = {|
  type: 'text',
  sharedText: string,
|};

type SharedImage = {|
  type: 'image',
  sharedImageUrl: string,
  fileName: string,
|};

type SharedFile = {|
  type: 'file',
  sharedFileUrl: string,
  fileName: string,
|};

/**
 * The data we get when the user "shares" to Zulip from another app.
 */
export type SharedData = SharedText | SharedImage | SharedFile;
