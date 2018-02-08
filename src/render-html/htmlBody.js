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
<div id="scroll-bottom" class="scroll-bottom hidden">
  <a href="" class="scroll-bottom">
    <svg class="scroll-bottom" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
      <path class="scroll-bottom" d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z"/>
    </svg>
  </a>
</div>
`;
