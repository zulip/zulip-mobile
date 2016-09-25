export const homeNarrow = {};

export const mentionedNarrow = [{
  negated: false,
  operator: 'is',
  operand: 'mentioned',
}];

export const privateNarrow = (emails) => {
  if (!emails) {
    return [{
      negated: false,
      operator: 'is',
      operand: 'private',
    }];
  }
  return [{
    negated: false,
    operator: 'pm-with',
    operand: emails.join(),
  }];
};

export const starredNarrow = [{
  negated: false,
  operator: 'is',
  operand: 'starred',
}];

export const streamNarrow = (stream) => [{
  negated: false,
  operator: 'stream',
  operand: stream,
}];

export const topicNarrow = (stream, topic) => [
  {
    negated: false,
    operator: 'stream',
    operand: stream,
  },
  {
    negated: false,
    operator: 'topic',
    operand: topic,
  }
];
