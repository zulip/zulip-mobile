import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

export default (timeEdited?: number, isOutbox: boolean, isStarred: boolean) => {
  if (timeEdited === undefined && !isStarred && !isOutbox) return '';

  const editedTime = timeEdited ? distanceInWordsToNow(timeEdited * 1000) : '';

  return `
    <div class="message-tags">
      ${timeEdited ? `<span class="message-tag">edited ${editedTime} ago</span>` : ''}
      ${isStarred ? '<span class="message-tag">starred</span>' : ''}
      ${isOutbox ? '<span class="activity-indicator" /span>' : ''}
    </div>
  `;
};
