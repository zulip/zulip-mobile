/* @flow strict-local */
import template from './template';
import type { ThemeName, MessageSnapshot, UserOrBot, Auth } from '../../types';
import { shortTime, humanDate } from '../../utils/date';
import getHtml from './html';

type HtmlContent = {
  tagHtml: string,
  contentHtml: string,
};

const geHtmlFromSnapshot = (snapshot: MessageSnapshot, user: UserOrBot | void): HtmlContent => {
  const { prev_content, prev_topic, content_html_diff, topic, rendered_content } = snapshot;

  if (prev_content !== undefined && prev_topic === undefined && content_html_diff !== undefined) {
    // Only content edited.
    return {
      tagHtml: template`<span class="message-tag">Edited by ${
        user ? user.full_name : 'unknown user'
      }</span>`,
      contentHtml: content_html_diff,
    };
  } else if (prev_content === undefined && prev_topic !== undefined) {
    // Only topic edited.
    return {
      tagHtml: template`<span class="message-tag">Topic edited by ${
        user ? user.full_name : 'unknown user'
      }</span>`,
      contentHtml: template`Topic:
      <span class="highlight_text_inserted">${topic}</span>
      <span class="highlight_text_deleted">${prev_topic}</span>`,
    };
  } else if (prev_topic !== undefined && content_html_diff !== undefined) {
    return {
      // Both topic and content edited.
      tagHtml: template`<span class="message-tag">Edited by ${
        user ? user.full_name : 'unknown user'
      }</span>`,
      contentHtml: template`Topic:
      <span class="highlight_text_inserted">${topic}</span>
      <span class="highlight_text_deleted">${prev_topic}</span>
      <br/>$!${content_html_diff}`,
    };
  } else {
    // Original message.
    return {
      tagHtml: template`<span class="message-tag">Original message</span>`,
      contentHtml: rendered_content,
    };
  }
};

const renderSnapshot = (snapshot: MessageSnapshot, usersById: Map<number, UserOrBot>): string => {
  const user = usersById.get(snapshot.user_id);
  const date = new Date(snapshot.timestamp * 1000);
  const editedTime = template`${humanDate(date)} ${shortTime(date)}`;
  const { tagHtml, contentHtml } = geHtmlFromSnapshot(snapshot, user);

  return template`
    <div class="edit-history-block">
      <div class="static-timestamp">${editedTime}</div>
      <span class="edit-history-content">$!${contentHtml}</span>
      <div class="message-tags">$!${tagHtml}</div>
    </div>`;
};

export default (
  editHistory: MessageSnapshot[],
  themeName: ThemeName,
  usersById: Map<number, UserOrBot>,
  auth: Auth,
): string => {
  let html: string = '';
  for (const snapshot of editHistory) {
    html += renderSnapshot(snapshot, usersById);
  }
  return getHtml(themeName, { scrollMessageId: null, auth }, html);
};
