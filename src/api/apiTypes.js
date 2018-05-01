/* @flow */
export type ApiUser = {
  avatar_url: string,
  bot_type?: number,
  bot_owner?: string,
  email: string,
  full_name: string,
  is_admin: boolean,
  is_active: boolean,
  is_bot: boolean,
  profile_data?: Object,
  timezone: string,
  user_id: 5584,
};

export type AuthenticationMethods = {
  dev: boolean,
  email: boolean,
  github: boolean,
  google: boolean,
  ldap: boolean,
  password: boolean,
};

export type ApiServerSettings = {
  authentication_methods: AuthenticationMethods,
  email_auth_enabled: boolean,
  msg: string,
  push_notifications_enabled: boolean,
  realm_description: string,
  realm_icon: string,
  realm_name: string,
  realm_uri: string,
  require_email_format_usernames: boolean,
  zulip_version: string,
};
