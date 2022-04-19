/* @flow strict-local */
import type { ApiResponseSuccess } from '../transportTypes';
import { apiGet } from '../apiFetch';
import { ApiError } from '../apiErrors';

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

type ServerApiResponseServerSettings = {|
  ...ApiResponseServerSettings,

  // When missing, the user requested the root domain of a Zulip server, but
  // there is no realm there. User error.
  //
  // (Also, the server has `ROOT_DOMAIN_LANDING_PAGE = False`, the default.
  // But the mobile client doesn't care about that; we just care that there
  // isn't a realm at the root.)
  //
  // Discussion:
  //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/.2Fserver_settings.3A.20.60realm_name.60.2C.20etc.2E/near/1334042
  //
  // TODO(server-future): Expect the error to be encoded in a proper error
  //   response instead of this missing property.
  // TODO(server-future): Then, when all supported servers give that error,
  //   make this property required.
  realm_name?: string,
|};

/** See https://zulip.com/api/get-server-settings */
export default async (realm: URL): Promise<ApiResponseServerSettings> => {
  const result: ServerApiResponseServerSettings = await apiGet(
    { apiKey: '', email: '', realm },
    'server_settings',
  );

  const { realm_name } = result;
  if (realm_name == null) {
    // See comment on realm_name in ServerApiResponseServerSettings.
    //
    // This error copies the proper error that servers *sometimes* give when
    // the root domain is requested and there's no realm there. [1]
    // Specifically, servers give this when
    // `ROOT_DOMAIN_LANDING_PAGE = True`. That circumstance makes no
    // difference to mobile.
    //
    // [1] Observed empirically. For details, see
    //   https://chat.zulip.org/#narrow/stream/412-api-documentation/topic/.2Fserver_settings.3A.20.60realm_name.60.2C.20etc.2E/near/1332900 .
    throw new ApiError(400, { code: 'BAD_REQUEST', msg: 'Subdomain required', result: 'error' });
  }

  return { ...result, realm_name };
};
