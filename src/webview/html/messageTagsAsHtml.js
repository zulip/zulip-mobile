/* @flow */
import escape from 'lodash.escape';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

export default (flags: Object, timeEdited?: number): string => {
  const isStarred = flags.indexOf('starred') > -1;
  if (timeEdited === undefined && !isStarred) return '';

  const editedTime = timeEdited ? distanceInWordsToNow(timeEdited * 1000) : '';

  return `<div class="message-tags">
  ${timeEdited ? `<span class="message-tag">edited ${escape(editedTime)} ago</span>` : ''}
  ${flags.indexOf('starred') > -1 ? '<span class="message-tag">starred</span>' : ''}
</div>
`;
};
