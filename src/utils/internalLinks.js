/* @flow strict-local */
import { addBreadcrumb } from '@sentry/react-native';
import * as internal_url from '@zulip/shared/js/internal_url';
import { makeUserId } from '../api/idTypes';
import type { Narrow, Stream, UserId } from '../types';
import { topicNarrow, streamNarrow, specialNarrow, pmNarrowFromRecipients } from './narrow';
import { pmKeyRecipientsFromIds } from './recipient';
import { ensureUnreachable } from '../generics';

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
// TODO: Take a URL object for `url` instead of a string.
// TODO: Parse into an array of objects with { negated, operator, operand },
//   like the web app's parse_narrow in static/js/hash_util.js.
// TODO(#3757): Use @zulip/shared for that parsing.
const getHashSegmentsFromNarrowLink = (url: string, realm: URL) => {
  const result = url.split(realm.toString()).pop().split('#narrow/').pop()
.split('/');

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
 * True just if the given URL string appears to be a link, either absolute
 * or relative, to a Zulip narrow on the given realm.
 *
 * This performs a call to `new URL` and therefore may take a fraction of a
 * millisecond.  Avoid using in a context where it might be called more than
 * 10 or 100 times per user action.
 */
export const isNarrowLink = (url: string, realm: URL): boolean => {
  const resolved = new URL(url, realm);
  return (
    resolved.origin === realm.origin
    && resolved.pathname === '/'
    && resolved.search === ''
    && /^#narrow\//i.test(resolved.hash)
  );
};

type LinkType = 'non-narrow' | 'home' | 'pm' | 'topic' | 'stream' | 'special';

/**
 * PRIVATE -- exported only for tests.
 *
 * This performs a call to `new URL` and therefore may take a fraction of a
 * millisecond.  Avoid using in a context where it might be called more than
 * 10 or 100 times per user action.
 */
// TODO: Work out what this does, write a jsdoc for its interface, and
// reimplement using URL object (not just for the realm)
export const getLinkType = (url: string, realm: URL): LinkType => {
  if (!isNarrowLink(url, realm)) {
    return 'non-narrow';
  }

  // isNarrowLink(…) is true, by early return above, so this call is OK.
  const hashSegments = getHashSegmentsFromNarrowLink(url, realm);

  if (
    (hashSegments.length === 2 && hashSegments[0] === 'pm-with')
    || (hashSegments.length === 4 && hashSegments[0] === 'pm-with' && hashSegments[2] === 'near')
  ) {
    return 'pm';
  }

  if (
    (hashSegments.length === 4 || hashSegments.length === 6)
    && hashSegments[0] === 'stream'
    && (hashSegments[2] === 'subject' || hashSegments[2] === 'topic')
  ) {
    return 'topic';
  }

  if (hashSegments.length === 2 && hashSegments[0] === 'stream') {
    return 'stream';
  }

  if (
    hashSegments.length === 2
    && hashSegments[0] === 'is'
    && /^(private|starred|mentioned)/i.test(hashSegments[1])
  ) {
    return 'special';
  }

  return 'home';
};

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
 *
 * This performs a call to `new URL` and therefore may take a fraction of a
 * millisecond.  Avoid using in a context where it might be called more than
 * 10 or 100 times per user action.
 */
export const getNarrowFromLink = (
  url: string,
  realm: URL,
  streamsById: Map<number, Stream>,
  streamsByName: Map<string, Stream>,
  ownUserId: UserId,
): Narrow | null => {
  const type = getLinkType(url, realm);

  if (type === 'non-narrow') {
    return null;
  }

  // isNarrowLink(…) is true, by early return above, so this call is OK.
  const hashSegments = getHashSegmentsFromNarrowLink(url, realm);

  switch (type) {
    case 'pm': {
      // TODO: This case is pretty useless in practice, due to basically a
      //   bug in the webapp: the URL that appears in the location bar for a
      //   group PM conversation excludes self, so it's unusable for anyone
      //   else.  In particular this will foil you if, say, you try to give
      //   someone else in the conversation a link to a particular message.
      const ids = parsePmOperand(hashSegments[1]);
      return pmNarrowFromRecipients(pmKeyRecipientsFromIds(ids, ownUserId));
    }
    case 'topic': {
      const stream = parseStreamOperand(hashSegments[1], streamsById, streamsByName);
      return stream && topicNarrow(stream.stream_id, parseTopicOperand(hashSegments[3]));
    }
    case 'stream': {
      const stream = parseStreamOperand(hashSegments[1], streamsById, streamsByName);
      return stream && streamNarrow(stream.stream_id);
    }
    case 'special':
      try {
        return specialNarrow(hashSegments[1]);
      } catch {
        return null;
      }
    case 'home':
      return null; // TODO(?): Give HOME_NARROW
    default:
      ensureUnreachable(type);
      return null;
  }
};

/**
 * From a URL and realm with `isNarrowLink(url, realm) === true`, give
 *   message_id if the URL ends in /near/{message_id}, otherwise give zero.
 *
 * This performs a call to `new URL` and therefore may take a fraction of a
 * millisecond.  Avoid using in a context where it might be called more than
 * 10 or 100 times per user action.
 */
export const getMessageIdFromLink = (url: string, realm: URL): number => {
  // isNarrowLink(…) is true, by jsdoc, so this call is OK.
  const hashSegments = getHashSegmentsFromNarrowLink(url, realm);

  // TODO: Very wrong; inspect `hashSegments` for this, not all of `url`.
  const isMessageLink = url.includes('near');

  return isMessageLink ? parseInt(hashSegments[hashSegments.lastIndexOf('near') + 1], 10) : 0;
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
