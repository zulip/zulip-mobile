// Assembled with help from Flowgen v1.10.0.
//
// The modules 'expo-apple-authentication/build/AppleAuthentication',
// 'expo-apple-authentication/build/AppleAuthenticationButton', and
// 'expo-apple-authentication/build/AppleAuthentication.types' are the
// result of passing those files in node_modules through Flowgen and
// doing some minor syntactic tweaks.

declare module 'expo-apple-authentication/build/AppleAuthentication' {
  import type {
    AppleAuthenticationSignInOptions,
    AppleAuthenticationRefreshOptions,
    AppleAuthenticationSignOutOptions,
    AppleAuthenticationCredential,
    AppleAuthenticationRevokeListener,
  } from 'expo-apple-authentication/build/AppleAuthentication.types';
  import typeof { AppleAuthenticationCredentialState } from 'expo-apple-authentication/build/AppleAuthentication.types';

  declare type Subscription = {
    remove: () => void,
  };

  declare export function isAvailableAsync(): Promise<boolean>;
  declare export function signInAsync(
    options?: AppleAuthenticationSignInOptions,
  ): Promise<AppleAuthenticationCredential>;
  declare export function refreshAsync(
    options: AppleAuthenticationRefreshOptions,
  ): Promise<AppleAuthenticationCredential>;
  declare export function signOutAsync(
    options: AppleAuthenticationSignOutOptions,
  ): Promise<AppleAuthenticationCredential>;
  declare export function getCredentialStateAsync(
    user: string,
  ): Promise<AppleAuthenticationCredentialState>;
  declare export function addRevokeListener(
    listener: AppleAuthenticationRevokeListener,
  ): Subscription;
}

declare module 'expo-apple-authentication/build/AppleAuthentication.types' {
  declare export type AppleAuthenticationButtonProps = {
    onPress: () => void | Promise<void>,
    buttonType: $Values<typeof AppleAuthenticationButtonType>,
    buttonStyle: $Values<typeof AppleAuthenticationButtonStyle>,
    cornerRadius?: number,
    style?: mixed,
    ...
  };
  /**
   * The options you can supply when making a call to `AppleAuthentication.signInAsync()`. None of
   * these options are required.
   * @see [Apple
   * Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationopenidrequest)
   * for more details.
   */
  declare export type AppleAuthenticationSignInOptions = {
    /**
     * The scope of personal information to which your app is requesting access. The user can choose
     * to deny your app access to any scope at the time of logging in.
     * @defaults `[]` (no scopes).
     */
    requestedScopes?: $Values<typeof AppleAuthenticationScope>[],

    /**
     * Data that's returned to you unmodified in the corresponding credential after a successful
     * authentication. Used to verify that the response was from the request you made. Can be used to
     * avoid replay attacks.
     */
    state?: string,

    /**
     * Data that is used to verify the uniqueness of a response and prevent replay attacks.
     */
    nonce?: string,
    ...
  };
  /**
   * The options you can supply when making a call to `AppleAuthentication.refreshAsync()`. You must
   * include the ID string of the user whose credentials you'd like to refresh.
   * @see [Apple
   * Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationopenidrequest)
   * for more details.
   */
  declare export type AppleAuthenticationRefreshOptions = {
    user: string,

    /**
     * The scope of personal information to which your app is requesting access. The user can choose
     * to deny your app access to any scope at the time of refreshing.
     * @defaults `[]` (no scopes).
     */
    requestedScopes?: $Values<typeof AppleAuthenticationScope>[],

    /**
     * Data that's returned to you unmodified in the corresponding credential after a successful
     * authentication. Used to verify that the response was from the request you made. Can be used to
     * avoid replay attacks.
     */
    state?: string,
    ...
  };
  /**
   * The options you can supply when making a call to `AppleAuthentication.signOutAsync()`. You must
   * include the ID string of the user to sign out.
   * @see [Apple
   * Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationopenidrequest)
   * for more details.
   */
  declare export type AppleAuthenticationSignOutOptions = {
    user: string,

    /**
     * Data that's returned to you unmodified in the corresponding credential after a successful
     * authentication. Used to verify that the response was from the request you made. Can be used to
     * avoid replay attacks.
     */
    state?: string,
    ...
  };
  /**
   * The user credentials returned from a successful call to `AppleAuthentication.signInAsync()`,
   * `AppleAuthentication.refreshAsync()`, or `AppleAuthentication.signOutAsync()`.
   * @see [Apple
   * Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidcredential)
   * for more details.
   */
  declare export type AppleAuthenticationCredential = {
    /**
     * An identifier associated with the authenticated user. You can use this to check if the user is
     * still authenticated later. This is stable and can be shared across apps released under the same
     * development team. The same user will have a different identifier for apps released by other
     * developers.
     */
    user: string,

    /**
     * An arbitrary string that your app provided as `state` in the request that generated the
     * credential. Used to verify that the response was from the request you made. Can be used to
     * avoid replay attacks.
     */
    state: string | null,

    /**
     * The user's name. May be `null` or contain `null` values if you didn't request the `FULL_NAME`
     * scope, if the user denied access, or if this is not the first time the user has signed into
     * your app.
     */
    fullName: AppleAuthenticationFullName | null,

    /**
     * The user's email address. Might not be present if you didn't request the `EMAIL` scope. May
     * also be null if this is not the first time the user has signed into your app. If the user chose
     * to withhold their email address, this field will instead contain an obscured email address with
     * an Apple domain.
     */
    email: string | null,

    /**
     * A value that indicates whether the user appears to the system to be a real person.
     */
    realUserStatus: $Values<typeof AppleAuthenticationUserDetectionStatus>,

    /**
     * A JSON Web Token (JWT) that securely communicates information about the user to your app.
     */
    identityToken: string,

    /**
     * A short-lived session token used by your app for proof of authorization when interacting with
     * the app's server counterpart. Unlike `user`, this is ephemeral and will change each session.
     */
    authorizationCode: string,
    ...
  };
  /**
   * An object representing the tokenized portions of the user's full name.
   */
  declare export type AppleAuthenticationFullName = {
    namePrefix: string | null,
    givenName: string | null,
    middleName: string | null,
    familyName: string | null,
    nameSuffix: string | null,
    nickname: string | null,
    ...
  };
  declare export type AppleAuthenticationRevokeListener = () => void;
  /**
   * Scopes you can request when calling `AppleAuthentication.signInAsync()` or
   * `AppleAuthentication.refreshAsync()`.
   * @note Note that it is possible that you will not be granted all of the scopes which you request.
   * You will still need to handle null values for any fields you request.
   * @see [Apple
   * Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationscope)
   * for more details.
   */

  declare export var AppleAuthenticationScope: {|
    +FULL_NAME: 0, // 0
    +EMAIL: 1, // 1
  |};

  declare export var AppleAuthenticationOperation: {|
    +IMPLICIT: 0, // 0
    +LOGIN: 1, // 1
    +REFRESH: 2, // 2
    +LOGOUT: 3, // 3
  |};

  /**
   * The state of the credential when checked with `AppleAuthentication.getCredentialStateAsync()`.
   * @see [Apple
   * Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidprovidercredentialstate)
   * for more details.
   */

  declare export var AppleAuthenticationCredentialState: {|
    +REVOKED: 0, // 0
    +AUTHORIZED: 1, // 1
    +NOT_FOUND: 2, // 2
    +TRANSFERRED: 3, // 3
  |};

  /**
   * A value that indicates whether the user appears to be a real person. You get this in the
   * realUserStatus property of a `Credential` object. It can be used as one metric to help prevent
   * fraud.
   * @see [Apple
   * Documentation](https://developer.apple.com/documentation/authenticationservices/asuserdetectionstatus)
   * for more details.
   */

  declare export var AppleAuthenticationUserDetectionStatus: {|
    +UNSUPPORTED: 0, // 0
    +UNKNOWN: 1, // 1
    +LIKELY_REAL: 2, // 2
  |};

  /**
   * Controls the predefined text shown on the authentication button.
   */

  declare export var AppleAuthenticationButtonType: {|
    +SIGN_IN: 0, // 0
    +CONTINUE: 1, // 1
  |};

  /**
   * Controls the predefined style of the authenticating button.
   */

  declare export var AppleAuthenticationButtonStyle: {|
    +WHITE: 0, // 0
    +WHITE_OUTLINE: 1, // 1
    +BLACK: 2, // 2
  |};
}

declare module 'expo-apple-authentication/build/AppleAuthenticationButton' {
  import type { StatelessFunctionalComponent } from 'react';
  /* eslint-disable-next-line */
  import type { AppleAuthenticationButtonProps } from 'expo-apple-authentication/build/AppleAuthentication.types';

  /**
   * This component displays the proprietary "Sign In with Apple" / "Continue with Apple" button on
   * your screen. The App Store Guidelines require you to use this component to start the sign in
   * process instead of a custom button. You can customize the design of the button using the
   * properties. You should start the sign in process when the `onPress` property is called.
   *
   * You should only attempt to render this if `AppleAuthentication.isAvailableAsync()` resolves to
   * true. This component will render nothing if it is not available and you will get a warning if
   * `__DEV__ === true`.
   *
   * The properties of this component extend from `View`; however, you should not attempt to set
   * `backgroundColor` or `borderRadius` with the `style` property. This will not work and is against
   * the App Store Guidelines. Instead, you should use the `buttonStyle` property to choose one of the
   * predefined color styles and the `cornerRadius` property to change the border radius of the
   * button.
   * @see [Apple
   * Documentation](https://developer.apple.com/documentation/authenticationservices/asauthorizationappleidbutton)
   * for more details.
   */
  declare type AppleAuthenticationButton = StatelessFunctionalComponent<AppleAuthenticationButtonProps>;
  declare export default AppleAuthenticationButton;
}

/*
 * Flowtype definitions for AppleAuthenticationButton
 * Generated by Flowgen from a Typescript Definition
 * Flowgen v1.10.0
 */
declare module 'expo-apple-authentication' {
  declare export * from 'expo-apple-authentication/build/AppleAuthentication'
  declare export * from 'expo-apple-authentication/build/AppleAuthentication.types'
  declare export {
    default as AppleAuthenticationButton,
  } from 'expo-apple-authentication/build/AppleAuthenticationButton';
}
