/* @flow */
import messageLoadingList from './messageLoadingListAsHtml';
import htmlScrollToBottom from './htmlScrollToBottom';

export default (content: string, showMessagePlaceholders: boolean): string => `
<div id="js-error"></div>
<div id="spinner-older" class="hidden loading-spinner"></div>

${content}

<div id="message-loading" class="${showMessagePlaceholders ? '' : 'hidden'}">
  ${messageLoadingList}
</div>

<div id="spinner-newer" class="hidden loading-spinner"></div>

<div id="typing"></div>

${htmlScrollToBottom}
`;
