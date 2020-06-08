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

export type ApiResponseServerSettings = {|
  ...ApiResponseSuccess,
  authentication_methods: AuthenticationMethods,
  // external_authentication_methods added for server v2.1
  external_authentication_methods?: ExternalAuthenticationMethod[],
  email_auth_enabled: boolean,
  push_notifications_enabled: boolean,
  realm_description: string,
  realm_icon: string,
  realm_name: string,
  realm_uri: string,
  require_email_format_usernames: boolean,
  zulip_version: string,
|};

/** See https://zulip.com/api/server-settings */
export default async (realm: string): Promise<ApiResponseServerSettings> =>
  apiGet({ apiKey: '', email: '', realm }, 'server_settings');
