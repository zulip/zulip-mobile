/* @flow */
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

export default (flags: Object, timeEdited?: number, isOutbox: boolean) => {
  const isStarred = flags.indexOf('starred') > -1;
  if (timeEdited === undefined && !isStarred && !isOutbox) return '';

  const editedTime = timeEdited ? distanceInWordsToNow(timeEdited * 1000) : '';

  return `
<div class="message-tags">
  ${timeEdited ? `<span class="message-tag">edited ${editedTime} ago</span>` : ''}
  ${flags.indexOf('starred') > -1 ? '<span class="message-tag">starred</span>' : ''}
  ${isOutbox ? '<span class="message-tag-spinner"><div class="loading-spinner"></div></span>' : ''}
</div>
  `;
};
