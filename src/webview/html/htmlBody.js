/* @flow strict-local */
import template from './template';

const messageLoadingHtml = template`
<div class="loading">
  <div class="loading-avatar"></div>
  <div class="loading-content">
    <div class="loading-subheader">
      <div class="block name"></div>
      <div class="block msg-timestamp show"></div>
    </div>
    <div class="block"></div>
    <div class="block"></div>
  </div>
</div>
`;

const htmlScrollToBottom = template`
<div id="scroll-bottom" class="scroll-bottom hidden">
  <a href="" class="scroll-bottom">
    <span class="text">Scroll to bottom</span>
    <svg class="scroll-bottom" width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path class="scroll-bottom" d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z"/>
    </svg>
  </a>
</div>
`;

export default (content: string, showMessagePlaceholders: boolean): string => template`
<div id="js-error-detailed"></div>
<div id="js-error-plain">Oh no! Something went wrong. Try again?</div>
<div id="js-error-plain-dummy">Oh no! Something went wrong. Try again?</div>
<div id="spinner-older" class="hidden loading-spinner"></div>

$!${content}

<div id="message-loading" class="${showMessagePlaceholders ? '' : 'hidden'}">
  $!${messageLoadingHtml.repeat(10)}
</div>

<div id="spinner-newer" class="hidden loading-spinner"></div>

<div id="typing"></div>

$!${htmlScrollToBottom}
`;
