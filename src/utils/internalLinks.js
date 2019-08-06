/* @flow strict-local */
import type { Narrow, User } from '../types';
import { topicNarrow, streamNarrow, groupNarrow, specialNarrow } from './narrow';
import { isUrlOnRealm } from './url';

export const getPathsFromUrl = (url: string = '', realm: string) => {
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

export const isInternalLink = (url: string, realm: string): boolean =>
  isUrlOnRealm(url, realm) ? /^(\/#narrow|#narrow)/i.test(url.split(realm).pop()) : false;

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

/** PRIVATE -- exported only for tests. */
export const transformToEncodedURI = (string: string): string =>
  string.replace(/\.\d/g, (match, p1, p2, offset, str) => `%${match[1]}`);

/** Parse the operand of a `stream` operator. */
const parseStreamOperand = operand => decodeURIComponent(transformToEncodedURI(operand));

/** Parse the operand of a `topic` or `subject` operator. */
const parseTopicOperand = operand => decodeURIComponent(transformToEncodedURI(operand));

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

export const getNarrowFromLink = (
  url: string,
  realm: string,
  usersById: Map<number, User>,
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
      return topicNarrow(parseStreamOperand(paths[1]), parseTopicOperand(paths[3]));
    case 'stream':
      return streamNarrow(parseStreamOperand(paths[1]));
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
