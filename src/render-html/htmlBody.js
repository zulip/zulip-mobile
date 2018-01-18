/* @flow */
import messageLoadingList from './messageLoadingListAsHtml';

export default (content: string, showMessagePlaceholders: boolean) => `
<div id="js-error"></div>
<div id="spinner-older" class="hidden loading-spinner"></div>

${content}

<div id="message-loading" class="${showMessagePlaceholders ? '' : 'hidden'}">
  ${messageLoadingList}
</div>

<div id="spinner-newer" class="hidden loading-spinner"></div>
<div id="typing"></div>
`;
