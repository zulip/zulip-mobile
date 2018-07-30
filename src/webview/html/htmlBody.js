/* @flow */
import template from './template';
import messageLoadingList from './messageLoadingListAsHtml';
import htmlScrollToBottom from './htmlScrollToBottom';

export default (content: string, showMessagePlaceholders: boolean): string => template`
<div id="js-error-detailed"></div>
<div id="js-error-plain" class="hidden">Oh no! Something went wrong. Try again?</div>
<div id="spinner-older" class="hidden loading-spinner"></div>

$!${content}

<div id="message-loading" class="${showMessagePlaceholders ? '' : 'hidden'}">
  $!${messageLoadingList}
</div>

<div id="spinner-newer" class="hidden loading-spinner"></div>

<div id="typing"></div>

$!${htmlScrollToBottom}
`;
