/* @flow strict-local */

/**
 * The feature level at which we want to say "channel" instead of "stream".
 *
 * Outside a per-account context, check the feature level of the active
 * account, if there is one and it has server data. If there isn't an active
 * account or it doesn't have server data, just choose "channel" terminology
 * unconditionally.
 */
// TODO(server-9.0) simplify away
// https://chat.zulip.org/api/changelog#changes-in-zulip-90
export const streamChannelRenameFeatureLevel = 255;

/**
 * A messageId: messageId map, from "stream" terminology to "channel".
 *
 * When appropriate (see streamChannelRenameFeatureLevel), use this to patch
 * UI-string data for all languages, so that the UI says "channel" instead
 * of "stream". See https://github.com/zulip/zulip-mobile/issues/5827 .
 *
 * For example, use this to make a copy of messages_en that has
 *
 *   "Notify stream": "Notify channel",
 *
 * instead of
 *
 *   "Notify stream": "Notify stream",
 *   "Notify channel": "Notify channel",
 *
 * and likewise for all the other languages.
 */
// TODO(server-9.0) simplify away
export const streamChannelRenamesMap: {| [string]: string |} = {
  stream: 'channel',
  'Notify stream': 'Notify channel',
  'Who can access the stream?': 'Who can access the channel?',
  'Only organization administrators and owners can edit streams.':
    'Only organization administrators and owners can edit channels.',
  '{realmName} only allows organization administrators or owners to make public streams.':
    '{realmName} only allows organization administrators or owners to make public channels.',
  '{realmName} only allows organization moderators, administrators, or owners to make public streams.':
    '{realmName} only allows organization moderators, administrators, or owners to make public channels.',
  '{realmName} only allows full organization members, moderators, administrators, or owners to make public streams.':
    '{realmName} only allows full organization members, moderators, administrators, or owners to make public channels.',
  '{realmName} only allows organization members, moderators, administrators, or owners to make public streams.':
    '{realmName} only allows organization members, moderators, administrators, or owners to make public channels.',
  '{realmName} only allows organization administrators or owners to make private streams.':
    '{realmName} only allows organization administrators or owners to make private channels.',
  '{realmName} only allows organization moderators, administrators, or owners to make private streams.':
    '{realmName} only allows organization moderators, administrators, or owners to make private channels.',
  '{realmName} only allows full organization members, moderators, administrators, or owners to make private streams.':
    '{realmName} only allows full organization members, moderators, administrators, or owners to make private channels.',
  '{realmName} only allows organization members, moderators, administrators, or owners to make private streams.':
    '{realmName} only allows organization members, moderators, administrators, or owners to make private channels.',
  '{realmName} does not allow anybody to make web-public streams.':
    '{realmName} does not allow anybody to make web-public channels.',
  '{realmName} only allows organization owners to make web-public streams.':
    '{realmName} only allows organization owners to make web-public channels.',
  '{realmName} only allows organization administrators or owners to make web-public streams.':
    '{realmName} only allows organization administrators or owners to make web-public channels.',
  '{realmName} only allows organization moderators, administrators, or owners to make web-public streams.':
    '{realmName} only allows organization moderators, administrators, or owners to make web-public channels.',
  'Cannot subscribe to stream': 'Cannot subscribe to channel',
  'Stream #{name} is private.': 'Channel #{name} is private.',
  'Please specify a stream.': 'Please specify a channel.',
  'Please specify a valid stream.': 'Please specify a valid channel.',
  'No messages in stream': 'No messages in channel',
  'All streams': 'All channels',
  // 'No messages in topic: {streamAndTopic}': 'No messages in topic: {channelAndTopic}',
  'Mute stream': 'Mute channel',
  'Unmute stream': 'Unmute channel',
  '{username} will not be notified unless you subscribe them to this stream.':
    '{username} will not be notified unless you subscribe them to this channel.',
  'Stream notifications': 'Channel notifications',
  'No streams found': 'No channels found',
  'Mark stream as read': 'Mark channel as read',
  'Failed to mute stream': 'Failed to mute channel',
  'Failed to unmute stream': 'Failed to unmute channel',
  'Stream settings': 'Channel settings',
  'Failed to show stream settings': 'Failed to show channel settings',
  'You are not subscribed to this stream': 'You are not subscribed to this channel',
  'Create new stream': 'Create new channel',
  Stream: 'Channel',
  'Edit stream': 'Edit channel',
  'Only organization admins are allowed to post to this stream.':
    'Only organization admins are allowed to post to this channel.',
  'Copy link to stream': 'Copy link to channel',
  'Failed to copy stream link': 'Failed to copy channel link',
  'A stream with this name already exists.': 'A channel with this name already exists.',
  Streams: 'Channels',
};
