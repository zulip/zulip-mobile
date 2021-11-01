/* @flow strict-local */
import type { InitialDataRealm } from './initialDataTypes';

/**
 * Property-value map for data in `update` or `update_dict` realm events.
 *
 * Use this as a source where we define the actual types for those events.
 *
 * We use our type InitialDataRealm for how the data appears in the
 * /register response. The properties are named differently between here and
 * in the /register response (InitialDataRealm has lots of properties that
 * start with "realm_"). But we expect the values to be typed the same.
 */
/* eslint-disable flowtype/generic-spacing */
/* prettier-ignore */
export type RealmDataForUpdate = $ReadOnly<{
  //
  // Keep alphabetical by the InitialDataRealm property. So by
  // realm_allow_edit_history, not by allow_edit_history, etc.
  //
  // If there's a property that exists in InitialDataRealm, but we don't use
  // it and the event doc doesn't mention it, write the InitialDataRealm
  // property in a code comment in the place where it would go here.
  //

  development_environment:
    $PropertyType<InitialDataRealm, 'development_environment'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'event_queue_longpoll_timeout_seconds'>,
  jitsi_server_url:
    $PropertyType<InitialDataRealm, 'jitsi_server_url'>,
  max_avatar_file_size_mib:
    $PropertyType<InitialDataRealm, 'max_avatar_file_size_mib'>,
  max_file_upload_size_mib:
    $PropertyType<InitialDataRealm, 'max_file_upload_size_mib'>,

  // TODO: Check if the doc really means this, instead of max_icon_file_size
  //   and max_icon_file_size_mib?
  icon_file_size: number,

  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'max_logo_file_size'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'max_logo_file_size_mib'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'max_message_length'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'max_stream_description_length'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'max_stream_name_length'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'max_topic_length'>,
  password_min_length:
    $PropertyType<InitialDataRealm, 'password_min_length'>,
  password_min_guesses:
    $PropertyType<InitialDataRealm, 'password_min_guesses'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_add_custom_emoji_policy'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_add_emoji_by_admins_only'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_allow_community_topic_editing'>,
  allow_edit_history:
    $PropertyType<InitialDataRealm, 'realm_allow_edit_history'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_allow_message_deleting'>,
  allow_message_editing:
    $PropertyType<InitialDataRealm, 'realm_allow_message_editing'>,
  authentication_methods:
    $PropertyType<InitialDataRealm, 'realm_authentication_methods'>,

  // realm_available_video_chat_providers doesn't have an event because it
  //   can only change when the server is restarted anyway; see
  //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/.60value.60.20in.20realm.20op.3A.20update/near/1276269

  avatar_changes_disabled:
    $PropertyType<InitialDataRealm, 'realm_avatar_changes_disabled'>,
  bot_creation_policy:
    $PropertyType<InitialDataRealm, 'realm_bot_creation_policy'>,
  bot_domain:
    $PropertyType<InitialDataRealm, 'realm_bot_domain'>,
  community_topic_editing_limit_seconds:
    $PropertyType<InitialDataRealm, 'realm_community_topic_editing_limit_seconds'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_create_private_stream_policy'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_create_public_stream_policy'>,

  // This is probably not correct; see what this was replaced with in
  //   InitialDataRealm
  create_stream_policy:
    $PropertyType<InitialDataRealm, 'realm_create_stream_policy'>,

  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_create_web_public_stream_policy'>,
  default_code_block_language:
    $PropertyType<InitialDataRealm, 'realm_default_code_block_language'>,

  // realm_default_external_accounts doesn't have an event because it can
  //   only change when the server is restarted anyway; see
  //   https://chat.zulip.org/#narrow/stream/378-api-design/topic/.60value.60.20in.20realm.20op.3A.20update/near/1276269

  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_default_language'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_default_twenty_four_hour_time'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_delete_own_message_policy'>,
  description:
    $PropertyType<InitialDataRealm, 'realm_description'>,
  digest_emails_enabled:
    $PropertyType<InitialDataRealm, 'realm_digest_emails_enabled'>,
  digest_weekday:
    $PropertyType<InitialDataRealm, 'realm_digest_weekday'>,

  // TODO: Number or boolean? Event doc and register-response doc disagree
  disallow_disposable_email_addresses: mixed, // realm_disallow_disposable_email_addresses

  edit_topic_policy:
    $PropertyType<InitialDataRealm, 'realm_edit_topic_policy'>,
  email_address_visibility:
    $PropertyType<InitialDataRealm, 'realm_email_address_visibility'>,
  email_auth_enabled:
    $PropertyType<InitialDataRealm, 'realm_email_auth_enabled'>,
  email_changes_disabled:
    $PropertyType<InitialDataRealm, 'realm_email_changes_disabled'>,
  emails_restricted_to_domains:
    $PropertyType<InitialDataRealm, 'realm_emails_restricted_to_domains'>,

  // TODO: Do we get `realm_giphy_rating` or `giphy_rating` in the event?
  //   Doc says `realm_giphy_rating` as of 2021-11-15 but that looks wrong.
  giphy_rating:
    $PropertyType<InitialDataRealm, 'realm_giphy_rating'>,
  realm_giphy_rating:
    $PropertyType<InitialDataRealm, 'realm_giphy_rating'>,

  // TODO: Do servers send this, here or in InitialDataRealm?
  //   realm_google_hangouts_domain

  icon_source:
    $PropertyType<InitialDataRealm, 'realm_icon_source'>,
  icon_url:
    $PropertyType<InitialDataRealm, 'realm_icon_url'>,
  inline_image_preview:
    $PropertyType<InitialDataRealm, 'realm_inline_image_preview'>,
  inline_url_embed_preview:
    $PropertyType<InitialDataRealm, 'realm_inline_url_embed_preview'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_invite_by_admins_only'>,
  invite_required:
    $PropertyType<InitialDataRealm, 'realm_invite_required'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_invite_to_realm_policy'>,
  invite_to_stream_policy:
    $PropertyType<InitialDataRealm, 'realm_invite_to_stream_policy'>,
  is_zephyr_mirror_realm:
    $PropertyType<InitialDataRealm, 'realm_is_zephyr_mirror_realm'>,
  logo_source:
    $PropertyType<InitialDataRealm, 'realm_logo_source'>,
  logo_url:
    $PropertyType<InitialDataRealm, 'realm_logo_url'>,
  mandatory_topics:
    $PropertyType<InitialDataRealm, 'realm_mandatory_topics'>,
  message_content_allowed_in_email_notifications:
    $PropertyType<InitialDataRealm, 'realm_message_content_allowed_in_email_notifications'>,
  message_content_delete_limit_seconds:
    $PropertyType<InitialDataRealm, 'realm_message_content_delete_limit_seconds'>,
  message_content_edit_limit_seconds:
    $PropertyType<InitialDataRealm, 'realm_message_content_edit_limit_seconds'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_message_retention_days'>,
  move_messages_between_streams_policy:
    $PropertyType<InitialDataRealm, 'realm_move_messages_between_streams_policy'>,
  realm_name:
    $PropertyType<InitialDataRealm, 'realm_name'>,
  name_changes_disabled:
    $PropertyType<InitialDataRealm, 'realm_name_changes_disabled'>,
  night_logo_source:
    $PropertyType<InitialDataRealm, 'realm_night_logo_source'>,
  night_logo_url:
    $PropertyType<InitialDataRealm, 'realm_night_logo_url'>,
  notifications_stream_id:
    $PropertyType<InitialDataRealm, 'realm_notifications_stream_id'>,
  password_auth_enabled:
    $PropertyType<InitialDataRealm, 'realm_password_auth_enabled'>,
  plan_type:
    $PropertyType<InitialDataRealm, 'realm_plan_type'>,
  presence_disabled:
    $PropertyType<InitialDataRealm, 'realm_presence_disabled'>,
  private_message_policy:
    $PropertyType<InitialDataRealm, 'realm_private_message_policy'>,
  push_notifications_enabled:
    $PropertyType<InitialDataRealm, 'realm_push_notifications_enabled'>,

  // TODO: Do servers send this, here or in InitialDataRealm?
  //   realm_restricted_to_domain

  send_welcome_emails:
    $PropertyType<InitialDataRealm, 'realm_send_welcome_emails'>,

  // TODO: Do servers send this, here or in InitialDataRealm?
  //   realm_show_digest_email

  signup_notifications_stream_id:
    $PropertyType<InitialDataRealm, 'realm_signup_notifications_stream_id'>,

  // The doc still has the old name (without _mib) as of 2021-11-15; this is
  //   probably wrong.
  upload_quota:
    $PropertyType<InitialDataRealm, 'realm_upload_quota'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'realm_upload_quota_mib'>,

  user_group_edit_policy:
    $PropertyType<InitialDataRealm, 'realm_user_group_edit_policy'>,
  realm_uri:
    $PropertyType<InitialDataRealm, 'realm_uri'>,
  video_chat_provider:
    $PropertyType<InitialDataRealm, 'realm_video_chat_provider'>,
  waiting_period_threshold:
    $PropertyType<InitialDataRealm, 'realm_waiting_period_threshold'>,
  wildcard_mention_policy:
    $PropertyType<InitialDataRealm, 'realm_wildcard_mention_policy'>,
  server_avatar_changes_disabled:
    $PropertyType<InitialDataRealm, 'server_avatar_changes_disabled'>,
  server_name_changes_disabled:
    $PropertyType<InitialDataRealm, 'server_name_changes_disabled'>,
  // <insert_name>:
  //   $PropertyType<InitialDataRealm, 'server_needs_upgrade'>,
  server_inline_url_embed_preview:
    $PropertyType<InitialDataRealm, 'server_inline_url_embed_preview'>,
  server_inline_image_preview:
    $PropertyType<InitialDataRealm, 'server_inline_image_preview'>,
  server_generation:
    $PropertyType<InitialDataRealm, 'server_generation'>,
  settings_send_digest_emails:
    $PropertyType<InitialDataRealm, 'settings_send_digest_emails'>,
  upgrade_text_for_wide_organization_logo:
    $PropertyType<InitialDataRealm, 'upgrade_text_for_wide_organization_logo'>,
  zulip_plan_is_not_limited:
    $PropertyType<InitialDataRealm, 'zulip_plan_is_not_limited'>,

  //
  // Keep alphabetical by the InitialDataRealm property. So by
  // realm_allow_edit_history, not by allow_edit_history, etc.
  //

  ...
}>;
