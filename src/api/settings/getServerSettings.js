/* @flow strict-local */
import type { ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';

// This corresponds to AUTHENTICATION_FLAGS in zulip/zulip:zerver/models.py .
export type AuthenticationMethods = {
  dev?: boolean,
  github?: boolean,
  google?: boolean,
  ldap?: boolean,
  password?: boolean,
  azuread?: boolean,
  remoteuser?: boolean,
  ...
};

export type ExternalAuthenticationMethod = {|
  name: string,
  display_name: string,
  display_icon: string | null,
  login_url: string,
  signup_url: string,
|};

/** https://zulip.com/api/get-server-settings */
// Current to FL 121.
export type ApiResponseServerSettings = {|
  ...$Exact<ApiResponseSuccess>,
  authentication_methods: AuthenticationMethods,

  // TODO(server-2.1): Mark this as required; simplify downstream.
  external_authentication_methods?: $ReadOnlyArray<ExternalAuthenticationMethod>,

  // TODO(server-3.0): New in FL 1. When absent, equivalent to 0.
  zulip_feature_level?: number,

  zulip_version: string,

  // TODO(server-5.0): New in FL 88.
  zulip_merge_base?: string,

  push_notifications_enabled: boolean,
  is_incompatible: boolean,
  email_auth_enabled: boolean,
  require_email_format_usernames: boolean,
  realm_uri: string,
  realm_name: string,
  realm_icon: string,
  realm_description: string,

  // TODO(server-5.0): New in FL 116.
  realm_web_public_access_enabled: boolean,
|};

/** See https://zulip.com/api/get-server-settings */
export default async (realm: URL): Promise<ApiResponseServerSettings> =>
  apiGet({ apiKey: '', email: '', realm }, 'server_settings');
