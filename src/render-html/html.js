/* @flow */
import css from './css';
import smoothScroll from './smoothScroll.min';
import js from './es3';
import messageLoadingList from './messageLoadingListAsHtml';

type InitOptionsType = {
  anchor: number,
  highlightUnreadMessages: boolean,
  showMessagePlaceholders: boolean,
};

export const htmlBody = (content: string, showMessagePlaceholders: boolean) => `
<div id="js-error"></div>
<div id="spinner-older" class="hidden loading-spinner"></div>

${content}

<div id="message-loading" class="${showMessagePlaceholders ? '' : 'hidden'}">
  ${messageLoadingList}
</div>

<div id="spinner-newer" class="hidden loading-spinner"></div>
<div id="typing"></div>
`;

export default (content: string, theme: string, initOptions: InitOptionsType) =>
  `
${css(theme, initOptions.highlightUnreadMessages)}

<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<body>
${htmlBody(content, initOptions.showMessagePlaceholders)}
</body>

<script>
window.__forceSmoothScrollPolyfill__ = true;
${smoothScroll}
${js}
scrollToAnchor(${initOptions.anchor})
</script>
`;
