export const homeNarrow = () => [];

export const isHomeNarrow = (narrow: []) =>
  narrow.length === 0;

export const privateNarrow = (email: string) => [{
  operator: 'pm-with',
  operand: email,
}];

export const isPrivateNarrow = (narrow: []) =>
  narrow.length === 1 &&
  narrow[0].operator === 'pm-with' &&
  narrow[0].operand.indexOf(',') === -1;

export const groupNarrow = (emails: string[]) => [{
  operator: 'pm-with',
  operand: emails.join(),
}];

export const isGroupNarrow = (narrow: []) =>
  narrow.length === 1 &&
  narrow[0].operator === 'pm-with' &&
  narrow[0].operand.indexOf(',') >= 0;

export const specialNarrow = (operand: string) => [{
  operator: 'is',
  operand,
}];

export const isSpecialNarrow = (narrow: []) =>
  narrow.length === 1 &&
  narrow[0].operator === 'is';

export const streamNarrow = (stream) => [{
  operator: 'stream',
  operand: stream,
}];

export const isStreamNarrow = (narrow: []) =>
  narrow.length === 1 &&
  narrow[0].operator === 'stream';

export const topicNarrow = (stream: string, topic: string) => [
  {
    operator: 'stream',
    operand: stream,
  },
  {
    operator: 'topic',
    operand: topic,
  },
];

export const isTopicNarrow = (narrow: []) =>
  narrow.length === 2 &&
  narrow[1].operator === 'topic';

export const searchNarrow = (query: string) => [{
  operator: 'search',
  operand: query,
}];

export const isSearchNarrow = (narrow: []) =>
  narrow.length === 1 &&
  narrow[0].operator === 'search';
