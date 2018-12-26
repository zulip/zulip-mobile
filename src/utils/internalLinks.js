/* @flow strict-local */
import type { Narrow, User } from '../types';
import { HOME_NARROW, topicNarrow, streamNarrow, groupNarrow, specialNarrow } from './narrow';
import { isUrlOnRealm } from './url';
import { transformToEncodedURI } from './string';
import { NULL_USER } from '../nullObjects';

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

export const isTopicLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isInternalLink(url, realm)
    && ((paths.length === 4 || paths.length === 6)
      && paths[0] === 'stream'
      && (paths[2] === 'subject' || paths[2] === 'topic'))
  );
};

export const isPmLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isInternalLink(url, realm)
    && ((paths.length === 2 && paths[0] === 'pm-with')
      || (paths.length === 4 && paths[0] === 'pm-with' && paths[2] === 'near'))
  );
};

export const isStreamLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return isInternalLink(url, realm) && paths.length === 2 && paths[0] === 'stream';
};

export const isSpecialLink = (url: string, realm: string): boolean => {
  const paths = getPathsFromUrl(url, realm);
  return (
    isInternalLink(url, realm)
    && paths.length === 2
    && paths[0] === 'is'
    && /^(private|starred|mentioned)/i.test(paths[1])
  );
};

type LinkType = 'home' | 'pm' | 'topic' | 'stream' | 'special';

export const getLinkType = (url: string, realm: string): LinkType => {
  const linkTypeDetectors = [
    { type: 'pm', func: isPmLink },
    { type: 'topic', func: isTopicLink },
    { type: 'stream', func: isStreamLink },
    { type: 'special', func: isSpecialLink },
  ];
  const type = linkTypeDetectors.find(x => x.func(url, realm));
  return type ? type.type : 'home';
};

export const getNarrowFromLink = (
  url: string,
  realm: string,
  usersById: Map<number, User>,
): Narrow => {
  const type = getLinkType(url, realm);
  const paths = getPathsFromUrl(url, realm);

  switch (type) {
    case 'pm': {
      const recipients = paths[1].split('-')[0].split(',');
      return groupNarrow(
        recipients.map(
          (recipient: string) => (usersById.get(parseInt(recipient, 10)) || NULL_USER).email,
        ),
      );
    }
    case 'topic':
      return topicNarrow(
        decodeURIComponent(transformToEncodedURI(paths[1])),
        decodeURIComponent(transformToEncodedURI(paths[3])),
      );
    case 'stream':
      return streamNarrow(decodeURIComponent(transformToEncodedURI(paths[1])));
    case 'special':
      return specialNarrow(paths[1]);
    default:
      return HOME_NARROW;
  }
};

export const getMessageIdFromLink = (url: string, realm: string): number => {
  const paths = getPathsFromUrl(url, realm);

  return isMessageLink(url, realm) ? parseInt(paths[paths.lastIndexOf('near') + 1], 10) : 0;
};
