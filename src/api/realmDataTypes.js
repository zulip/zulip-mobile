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
/* prettier-ignore */
// Current to FL 130.
export type RealmDataForUpdate = $ReadOnly<{
  //
  // Keep alphabetical by the InitialDataRealm property. So by
  // realm_allow_edit_history, not by allow_edit_history, etc.
  //
  // If there's a property that exists in InitialDataRealm, but we don't use
  // it and the event doc doesn't mention it, write the InitialDataRealm
  // property in a code comment in the place where it would go here.
  //

  add_custom_emoji_policy:
    InitialDataRealm['realm_add_custom_emoji_policy'],
  allow_community_topic_editing: // deprecated
    InitialDataRealm['realm_allow_community_topic_editing'],
  allow_edit_history:
    InitialDataRealm['realm_allow_edit_history'],
  allow_message_editing:
    InitialDataRealm['realm_allow_message_editing'],
  authentication_methods:
    InitialDataRealm['realm_authentication_methods'],
  bot_creation_policy:
    InitialDataRealm['realm_bot_creation_policy'],
  community_topic_editing_limit_seconds:
    InitialDataRealm['realm_community_topic_editing_limit_seconds'],
  create_private_stream_policy:
    InitialDataRealm['realm_create_private_stream_policy'],
  create_public_stream_policy:
    InitialDataRealm['realm_create_public_stream_policy'],
  create_web_public_stream_policy:
    InitialDataRealm['realm_create_web_public_stream_policy'],
  create_stream_policy: // deprecated
    InitialDataRealm['realm_create_stream_policy'],
  default_code_block_language:
    InitialDataRealm['realm_default_code_block_language'],
  default_language:
    InitialDataRealm['realm_default_language'],
  description:
    InitialDataRealm['realm_description'],
  digest_emails_enabled:
    InitialDataRealm['realm_digest_emails_enabled'],
  digest_weekday:
    InitialDataRealm['realm_digest_weekday'],
  disallow_disposable_email_addresses:
    InitialDataRealm['realm_disallow_disposable_email_addresses'],
  edit_topic_policy:
    InitialDataRealm['realm_edit_topic_policy'],
  email_address_visibility:
    InitialDataRealm['realm_email_address_visibility'],
  email_changes_disabled:
    InitialDataRealm['realm_email_changes_disabled'],
  emails_restricted_to_domains:
    InitialDataRealm['realm_emails_restricted_to_domains'],
  enable_spectator_access:
    InitialDataRealm['realm_enable_spectator_access'],
  giphy_rating:
    InitialDataRealm['realm_giphy_rating'],
  icon_source:
    InitialDataRealm['realm_icon_source'],
  icon_url:
    InitialDataRealm['realm_icon_url'],
  inline_image_preview:
    InitialDataRealm['realm_inline_image_preview'],
  inline_url_embed_preview:
    InitialDataRealm['realm_inline_url_embed_preview'],
  invite_by_admins_only: // deprecated
    InitialDataRealm['realm_invite_by_admins_only'],
  invite_required:
    InitialDataRealm['realm_invite_required'],
  invite_to_realm_policy:
    InitialDataRealm['realm_invite_to_realm_policy'],
  invite_to_stream_policy:
    InitialDataRealm['realm_invite_to_stream_policy'],
  logo_source:
    InitialDataRealm['realm_logo_source'],
  logo_url:
    InitialDataRealm['realm_logo_url'],
  mandatory_topics:
    InitialDataRealm['realm_mandatory_topics'],
  message_content_allowed_in_email_notifications:
    InitialDataRealm['realm_message_content_allowed_in_email_notifications'],
  message_content_delete_limit_seconds:
    InitialDataRealm['realm_message_content_delete_limit_seconds'],
  message_content_edit_limit_seconds:
    InitialDataRealm['realm_message_content_edit_limit_seconds'],
  move_messages_between_streams_policy:
    InitialDataRealm['realm_move_messages_between_streams_policy'],
  name:
    InitialDataRealm['realm_name'],
  name_changes_disabled:
    InitialDataRealm['realm_name_changes_disabled'],
  night_logo_source:
    InitialDataRealm['realm_night_logo_source'],
  night_logo_url:
    InitialDataRealm['realm_night_logo_url'],
  notifications_stream_id:
    InitialDataRealm['realm_notifications_stream_id'],
  plan_type:
    InitialDataRealm['realm_plan_type'],
  presence_disabled:
    InitialDataRealm['realm_presence_disabled'],
  private_message_policy:
    InitialDataRealm['realm_private_message_policy'],
  send_welcome_emails:
    InitialDataRealm['realm_send_welcome_emails'],
  signup_notifications_stream_id:
    InitialDataRealm['realm_signup_notifications_stream_id'],
  user_group_edit_policy:
    InitialDataRealm['realm_user_group_edit_policy'],
  video_chat_provider:
    InitialDataRealm['realm_video_chat_provider'],
  waiting_period_threshold:
    InitialDataRealm['realm_waiting_period_threshold'],
  want_advertise_in_communities_directory:
    InitialDataRealm['realm_want_advertise_in_communities_directory'],
  wildcard_mention_policy:
    InitialDataRealm['realm_wildcard_mention_policy'],

  //
  // Keep alphabetical by the InitialDataRealm property. So by
  // realm_allow_edit_history, not by allow_edit_history, etc.
  //

  ...
}>;
