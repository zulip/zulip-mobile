/* @flow strict-local */
import { addBreadcrumb } from '@sentry/react-native';
import * as internal_url from '@zulip/shared/lib/internal_url';
import { makeUserId } from '../api/idTypes';
import type { Narrow, Stream, UserId, Message, Outbox, PmMessage, PmOutbox } from '../types';
import { topicNarrow, streamNarrow, specialNarrow, pmNarrowFromRecipients } from './narrow';
import { pmKeyRecipientsFromIds, recipientsOfPrivateMessage } from './recipient';
import { isUrlOnRealm } from './url';

/**
 * For narrow URL https://zulip.example/#narrow/foo/bar, split the part of
 *   the hash after #narrow/ to give ['foo', 'bar'].
 *
 * The passed `url` must appear to be a link to a Zulip narrow on the given
 * `realm`. In particular, `isNarrowLink(url, realm)` must be true.
 *
 * If `url` ends with a slash, the returned array won't have '' as its last
 * element; that element is removed.
 */
// TODO: Parse into an array of objects with { negated, operator, operand },
//   like the web app's parse_narrow in static/js/hash_util.js.
// TODO(#3757): Use @zulip/shared for that parsing.
const getHashSegmentsFromNarrowLink = (url: URL, realm: URL) => {
  const result = url.hash
    .split('/')
    // Remove the first item, "#narrow".
    .slice(1);

  if (result[result.length - 1] === '') {
    // url ends with /
    result.splice(-1, 1);
  }
  return result;
};

/**
 * PRIVATE -- exported only for tests.
 *
 * Test for a link to a Zulip narrow on the given realm.
 *
 * True just if the given URL appears to be a link to a Zulip narrow on the
 * given realm.
 */
export const isNarrowLink = (url: URL, realm: URL): boolean =>
  isUrlOnRealm(url, realm)
  && url.pathname === '/'
  && url.search === ''
  && /^#narrow\//i.test(url.hash);

/** Decode a dot-encoded string. */
// The Zulip webapp uses this encoding in narrow-links:
// https://github.com/zulip/zulip/blob/1577662a6/static/js/hash_util.js#L18-L25
export const decodeHashComponent = (string: string): string => {
  try {
    return decodeURIComponent(string.replace(/\./g, '%'));
  } catch (err) {
    // `decodeURIComponent` throws strikingly uninformative errors
    addBreadcrumb({
      level: 'info',
      type: 'decoding',
      message: 'decodeHashComponent error',
      data: { input: string },
    });
    throw err;
  }
};

/**
 * Parse the operand of a `stream` operator.
 *
 * Return null if the operand doesn't match any known stream.
 */
const parseStreamOperand = (operand, streamsById, streamsByName): null | Stream => {
  // "New" (2018) format: ${stream_id}-${stream_name} .
  const match = /^([\d]+)(?:-.*)?$/.exec(operand);
  if (match) {
    const streamId = parseInt(match[1], 10);
    const stream = streamsById.get(streamId);
    if (stream) {
      return stream;
    }
  }

  // Old format: just stream name.  This case is relevant indefinitely,
  // so that links in old conversations continue to work.
  const streamName = decodeHashComponent(operand);
  const stream = streamsByName.get(streamName);
  if (stream) {
    return stream;
  }

  // Not any stream we know.  (Most likely this means a stream the user
  // doesn't have permission to see the existence of -- like with a guest
  // user for any stream they're not in, or any non-admin with a private
  // stream they're not in.  Could also be an old-format link to a stream
  // that's since been renamed… or whoever wrote the link could always have
  // just made something up.)
  return null;
};

/** Parse the operand of a `topic` or `subject` operator. */
const parseTopicOperand = operand => decodeHashComponent(operand);

/** Parse the operand of a `pm-with` operator. */
const parsePmOperand = operand => {
  const idStrs = operand.split('-')[0].split(',');
  return idStrs.map(s => makeUserId(parseInt(s, 10)));
};

/**
 * TODO write jsdoc
 */
export const getNarrowFromLink = (
  url: URL,
  realm: URL,
  streamsById: Map<number, Stream>,
  streamsByName: Map<string, Stream>,
  ownUserId: UserId,
): Narrow | null => {
  if (!isNarrowLink(url, realm)) {
    return null;
  }

  // isNarrowLink(…) is true, by early return above, so this call is OK.
  const hashSegments = getHashSegmentsFromNarrowLink(url, realm);

  if (
    (hashSegments.length === 2 && hashSegments[0] === 'pm-with')
    || (hashSegments.length === 4 && hashSegments[0] === 'pm-with' && hashSegments[2] === 'near')
  ) {
    // TODO: This case is pretty useless in practice, due to basically a
    //   bug in the webapp: the URL that appears in the location bar for a
    //   group PM conversation excludes self, so it's unusable for anyone
    //   else.  In particular this will foil you if, say, you try to give
    //   someone else in the conversation a link to a particular message.
    const ids = parsePmOperand(hashSegments[1]);
    return pmNarrowFromRecipients(pmKeyRecipientsFromIds(ids, ownUserId));
  }

  if (
    (hashSegments.length === 4 || hashSegments.length === 6)
    && hashSegments[0] === 'stream'
    && (hashSegments[2] === 'subject' || hashSegments[2] === 'topic')
  ) {
    const stream = parseStreamOperand(hashSegments[1], streamsById, streamsByName);
    return stream && topicNarrow(stream.stream_id, parseTopicOperand(hashSegments[3]));
  }

  if (hashSegments.length === 2 && hashSegments[0] === 'stream') {
    const stream = parseStreamOperand(hashSegments[1], streamsById, streamsByName);
    return stream && streamNarrow(stream.stream_id);
  }

  if (
    hashSegments.length === 2
    && hashSegments[0] === 'is'
    && /^(private|starred|mentioned)/i.test(hashSegments[1])
  ) {
    try {
      return specialNarrow(hashSegments[1]);
    } catch {
      return null;
    }
  }

  return null; // TODO(?) Give HOME_NARROW
};

/**
 * From a URL and realm with `isNarrowLink(url, realm) === true`, give
 *   message_id if the URL has /near/{message_id}, otherwise give null.
 */
export const getNearOperandFromLink = (url: URL, realm: URL): number | null => {
  // isNarrowLink(…) is true, by jsdoc, so this call is OK.
  const hashSegments = getHashSegmentsFromNarrowLink(url, realm);

  // This and nearOperandIndex can simplify when we rename/repurpose
  //   getHashSegmentsFromNarrowLink so it gives an array of
  //   { negated, operator, operand } objects; see TODO there.
  const nearOperatorIndex = hashSegments.findIndex(
    (str, i) =>
      // This is a segment where we expect an operator to be specified.
      i % 2 === 0
      // The operator is 'near' and its meaning is not negated (`str` does
      // not start with "-").
      && str === 'near',
  );
  if (nearOperatorIndex < 0) {
    return null;
  }

  // We expect an operand to directly follow its operator.
  const nearOperandIndex = nearOperatorIndex + 1;

  const nearOperandStr = hashSegments[nearOperandIndex];
  // Must look like a message ID
  if (!/^[0-9]+$/.test(nearOperandStr)) {
    return null;
  }

  return parseInt(nearOperandStr, 10);
};

export const getStreamTopicUrl = (
  realm: URL,
  streamId: number,
  topic: string,
  streamsById: Map<number, Stream>,
): URL => {
  const maybe_get_stream_name = id => streamsById.get(id)?.name;
  const path = internal_url.by_stream_topic_url(streamId, topic, maybe_get_stream_name);
  return new URL(path, realm);
};

export const getStreamUrl = (
  realm: URL,
  streamId: number,
  streamsById: Map<number, Stream>,
): URL => {
  const maybe_get_stream_name = id => streamsById.get(streamId)?.name;
  const path = internal_url.by_stream_url(streamId, maybe_get_stream_name);
  return new URL(path, realm);
};

/**
 * A /pm-with/ link for a whole PM conversation a message belongs to.
 */
// Based on pm_perma_link in static/js/people.js in the zulip/zulip repo.
// TODO(shared): Share that code.
export const getPmConversationLinkForMessage = (realm: URL, message: PmMessage | PmOutbox): URL => {
  const recipientIds = recipientsOfPrivateMessage(message)
    .map(r => r.id)
    .sort((a, b) => a - b);
  const suffix = recipientIds.length >= 3 ? 'group' : 'pm';
  const slug = `${recipientIds.join(',')}-${suffix}`;
  return new URL(`#narrow/pm-with/${slug}`, realm);
};

/**
 * A /near/ link to a given message, as a URL object.
 */
export const getMessageUrl = (
  realm: URL,
  message: Message | Outbox,
  streamsById: Map<number, Stream>,
): URL => {
  let result = undefined;

  // Build the part that points to the message's conversation…
  if (message.type === 'stream') {
    result = getStreamTopicUrl(realm, message.stream_id, message.subject, streamsById);
  } else {
    result = getPmConversationLinkForMessage(realm, message);
  }

  // …then add the part that points to the message.
  result.hash += `/near/${message.id}`;

  return result;
};
