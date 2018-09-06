/* @flow */
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import template from './template';

export default (flags: Object, timeEdited: ?number): string => {
  const isStarred = flags.indexOf('starred') > -1;
  if (timeEdited === undefined && !isStarred) {
    return '';
  }

  const editedTime = timeEdited ? distanceInWordsToNow(timeEdited * 1000) : '';

  return template`<div class="message-tags">
  $!${timeEdited ? template`<span class="message-tag">edited ${editedTime} ago</span>` : ''}
  $!${flags.indexOf('starred') > -1 ? '<span class="message-tag">starred</span>' : ''}
</div>
`;
};
