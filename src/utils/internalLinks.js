/* @flow strict-local */
import { addBreadcrumb } from '@sentry/react-native';
import type { Narrow, Message, Stream, User } from '../types';
import { topicNarrow, streamNarrow, groupNarrow, specialNarrow } from './narrow';
import { isUrlOnRealm } from './url';

const getPathsFromUrl = (url: string = '', realm: string) => {
  const paths = url
    .split(realm)
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

/** PRIVATE -- exported only for tests. */
export const isInternalLink = (url: string, realm: string): boolean =>
  isUrlOnRealm(url, realm) ? /^(\/#narrow|#narrow)/i.test(url.split(realm).pop()) : false;

/** PRIVATE -- exported only for tests. */
export const isMessageLink = (url: string, realm: string): boolean =>
  isInternalLink(url, realm) && url.includes('near');

type LinkType = 'external' | 'home' | 'pm' | 'topic' | 'stream' | 'special';

export const getLinkType = (url: string, realm: string): LinkType => {
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

// Duplicated from
// https://github.com/zulip/zulip/blob/1577662a6/static/js/hash_util.js#L18-L25;
// #3757 addresses using @zulip/shared for this and decodeHashComponent.
export const encodeHashComponent = (string: string): string =>
  encodeURIComponent(string)
    .replace(/\./g, '%2E')
    .replace(/%/g, '.');

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

/**
 * Produce the operand of a `stream` operator from a message.
 * See encode_stream_id in `static/js/hash_util` in the web app.
 * */
const unparseStreamOperand = (message: Message) => {
  const name = (message.display_recipient || 'unknown').replace(' ', '-');
  return encodeHashComponent(`${message.stream_id.toString()}-${name}`);
};

/** Parse the operand of a `topic` or `subject` operator. */
const parseTopicOperand = operand => decodeHashComponent(operand);

/** Produce the operand of a `topic` or `subject` operator from a message */
const unparseTopicOperand = (message: Message) => encodeHashComponent(message.subject);

/** Parse the operand of a `pm-with` operator. */
const parsePmOperand = (operand, usersById) => {
  const recipientIds = operand.split('-')[0].split(',');
  const recipientEmails = [];
  for (let i = 0; i < recipientIds.length; ++i) {
    const user = usersById.get(parseInt(recipientIds[i], 10));
    if (user === undefined) {
      return null;
    }
    recipientEmails.push(user.email);
  }
  return recipientEmails;
};

const unparsePmOperand = (message: Message) => {
  if (message.type !== 'private') {
    throw new Error('unparsePmOperand called with a non-pm message!');
  }

  // Compare `pm_perma_link` in the webapp's `static/js/people.js` for -group
  // and -pm logic
  const suffix = message.display_recipient.length >= 3 ? 'group' : 'pm';
  return `${message.display_recipient
    .map(recipient => encodeHashComponent(recipient.id.toString()))
    .join(',')}-${suffix}`;
};

export const getNarrowFromLink = (
  url: string,
  realm: string,
  usersById: Map<number, User>,
  streamsById: Map<number, Stream>,
): Narrow | null => {
  const type = getLinkType(url, realm);
  const paths = getPathsFromUrl(url, realm);

  switch (type) {
    case 'pm': {
      const recipientEmails = parsePmOperand(paths[1], usersById);
      if (recipientEmails === null) {
        return null;
      }
      return groupNarrow(recipientEmails);
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

export const getMessageIdFromLink = (url: string, realm: string): number => {
  const paths = getPathsFromUrl(url, realm);

  return isMessageLink(url, realm) ? parseInt(paths[paths.lastIndexOf('near') + 1], 10) : 0;
};

// Compare `by_conversation_and_time_uri` in the webapp's `static/js/hash_util.js`.
export const getLinkToMessage = (realm: string, message: Message): string => {
  const conversationPath =
    message.type === 'stream'
      ? `stream/${unparseStreamOperand(message)}/topic/${unparseTopicOperand(message)}`
      : `pm-with/${unparsePmOperand(message)}`;
  return `${realm}/#narrow/${conversationPath}/near/${encodeHashComponent(message.id.toString())}`;
};
