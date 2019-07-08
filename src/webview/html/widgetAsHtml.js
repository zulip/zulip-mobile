/* @flow strict-local */
import type { Submessage } from '../../types';
import template from './template';

/**
 * Option submessages are of type -
 * {
 *    type: 'new_option',
 *    idx: number,
 *    option: string (Question String),
 * }
 */
const extractPollOptions = submessages => {
  const pollOptions = submessages
    .filter(submessage => JSON.parse(submessage.content).type === 'new_option')
    .reduce((options, option) => {
      const rawOption = JSON.parse(option.content);
      const optionId = rawOption.idx;
      options.set(optionId.toString(), {
        id: optionId,
        option: rawOption.option,
        voters: [],
      });
      return options;
    }, new Map());

  /**
   * Vote submessages are of type -
   * {
   *    type: 'vote',
   *    key: string ((Voter's user ID) + , + (IDX of option)),
   *    vote: number,
   * }
   */
  const pollVotes = submessages
    .filter(submessage => JSON.parse(submessage.content).type === 'vote')
    .map(vote => JSON.parse(vote.content));

  pollVotes.forEach(vote => {
    const voterUserId = vote.key.split(',')[0];
    const votedOption = vote.key.split(',')[1];
    const optionFromVote = pollOptions.get(votedOption);
    if (!optionFromVote) {
      return;
    }

    if (vote.vote === -1) {
      optionFromVote.voters = optionFromVote.voters.filter(voter => voter !== voterUserId);
      return;
    }
    optionFromVote.voters.push(voterUserId);
  });
  return pollOptions;
};

const pollWidgetAsHtml = (ownUserId, submessages): string => {
  const htmlPieces: string[] = [];
  let pollOptions = new Map();

  const widgetMetadata = JSON.parse(submessages[0].content);

  htmlPieces.push('<div class="poll">');
  htmlPieces.push(template`<div class="poll-question">${widgetMetadata.extra_data.question}</div>`);

  pollOptions = extractPollOptions(submessages);

  if (pollOptions.size === 0) {
    htmlPieces.push('<i>No options have yet been added to this widget.</i>');
  }

  pollOptions.forEach(option => {
    htmlPieces.push(template`
<div class="poll-option-container">
  <div class="poll-button${
    option.voters.find(voter => voter === ownUserId.toString()) ? ' self-voted' : ''
  }">
    ${option.voters.length}</div>
  <div class="poll-option">${option.option}</div>
</div>
`);
  });

  htmlPieces.push('</div>');
  return htmlPieces.join('');
};

export default (
  ownUserId: number,
  submessages: $ReadOnlyArray<Submessage>,
  contentHtml: string,
) => {
  const widgetMetadata = JSON.parse(submessages[0].content);

  if (widgetMetadata.widget_type === 'poll') {
    return pollWidgetAsHtml(ownUserId, submessages);
  }

  return template`
$!${contentHtml}
<div class="widget">
 <p>Interactive message</p>
 <p>To use, open on web or desktop</p>
</div>
`;
};
