/* @flow strict-local */
import { addBreadcrumb } from '@sentry/react-native';
import type { Narrow, Stream, User } from '../types';
import { topicNarrow, streamNarrow, pmNarrowFromEmails, specialNarrow } from './narrow';
import { pmKeyRecipientsFromIds } from './recipient';
import { isUrlOnRealm } from './url';

// TODO: Work out what this does, write a jsdoc for its interface, and
// reimplement using URL object (not just for the realm)
const getPathsFromUrl = (url: string = '', realm: URL) => {
  const paths = url
    .split(realm.toString())
    .pop()
    .split('#narrow/')
    .pop()
    .split('/');

  if (paths.length > 0 && paths[paths.length - 1] === '') {
    // url ends with /
    paths.splice(-1, 1);
  }
  return paths;
};

// TODO: Work out what this does, write a jsdoc for its interface, and
// reimplement using URL object (not just for the realm)
/** PRIVATE -- exported only for tests. */
export const isInternalLink = (url: string, realm: URL): boolean =>
  isUrlOnRealm(url, realm)
    ? /^(\/#narrow|#narrow)/i.test(url.split(realm.toString()).pop())
    : false;

// TODO: Work out what this does, write a jsdoc for its interface, and
// reimplement using URL object (not just for the realm)
/** PRIVATE -- exported only for tests. */
export const isMessageLink = (url: string, realm: URL): boolean =>
  isInternalLink(url, realm) && url.includes('near');

type LinkType = 'external' | 'home' | 'pm' | 'topic' | 'stream' | 'special';

// TODO: Work out what this does, write a jsdoc for its interface, and
// reimplement using URL object (not just for the realm)
export const getLinkType = (url: string, realm: URL): LinkType => {
  if (!isInternalLink(url, realm)) {
    return 'external';
  }

  const paths = getPathsFromUrl(url, realm);

  if (
    (paths.length === 2 && paths[0] === 'pm-with')
    || (paths.length === 4 && paths[0] === 'pm-with' && paths[2] === 'near')
  ) {
    return 'pm';
  }

  if (
    (paths.length === 4 || paths.length === 6)
    && paths[0] === 'stream'
    && (paths[2] === 'subject' || paths[2] === 'topic')
  ) {
    return 'topic';
  }

  if (paths.length === 2 && paths[0] === 'stream') {
    return 'stream';
  }

  if (paths.length === 2 && paths[0] === 'is' && /^(private|starred|mentioned)/i.test(paths[1])) {
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

/** Parse the operand of a `stream` operator, returning a stream name. */
const parseStreamOperand = (operand, streamsById): string => {
  // "New" (2018) format: ${stream_id}-${stream_name} .
  const match = /^(\d+)-/.exec(operand);
  if (match) {
    const stream = streamsById.get(parseInt(match[0], 10));
    if (stream) {
      return stream.name;
    }
  }

  // Old format: just stream name.  This case is relevant indefinitely,
  // so that links in old conversations continue to work.
  return decodeHashComponent(operand);
};

/** Parse the operand of a `topic` or `subject` operator. */
const parseTopicOperand = operand => decodeHashComponent(operand);

/** Parse the operand of a `pm-with` operator. */
const parsePmOperand = operand => {
  const idStrs = operand.split('-')[0].split(',');
  return idStrs.map(s => parseInt(s, 10));
};

export const getNarrowFromLink = (
  url: string,
  realm: URL,
  usersById: Map<number, User>,
  streamsById: Map<number, Stream>,
  ownUserId: number,
): Narrow | null => {
  const type = getLinkType(url, realm);
  const paths = getPathsFromUrl(url, realm);

  switch (type) {
    case 'pm': {
      const ids = parsePmOperand(paths[1]);
      const users = pmKeyRecipientsFromIds(ids, usersById, ownUserId);
      return users && pmNarrowFromEmails(users.map(u => u.email));
    }
    case 'topic':
      return topicNarrow(parseStreamOperand(paths[1], streamsById), parseTopicOperand(paths[3]));
    case 'stream':
      return streamNarrow(parseStreamOperand(paths[1], streamsById));
    case 'special':
      return specialNarrow(paths[1]);
    default:
      return null;
  }
};

export const getMessageIdFromLink = (url: string, realm: URL): number => {
  const paths = getPathsFromUrl(url, realm);

  return isMessageLink(url, realm) ? parseInt(paths[paths.lastIndexOf('near') + 1], 10) : 0;
};
