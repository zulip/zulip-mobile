/* @flow */
import css from './css';
import smoothScroll from './smoothScroll.min';
import js from './es3';
import messageLoadingList from './messageLoadingListAsHtml';

type InitOptionsType = {
  anchor: number,
  showMessagePlaceholders: boolean,
};

export default (content: string, theme: string, initOptions: InitOptionsType) =>
  `
${css(theme)}

<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<body>
<div id="js-error"></div>
<div id="spinner-older" class="hidden loading-spinner"></div>
<div id="message-list">${content}</div>

<div id="message-loading" class="${initOptions.showMessagePlaceholders ? '' : 'hidden'}">
  ${messageLoadingList}
</div>

<div id="spinner-newer" class="hidden loading-spinner"></div>
<div id="typing"></div>
</body>

<script>
window.__forceSmoothScrollPolyfill__ = true;
${smoothScroll}
${js}
scrollToAnchor(${initOptions.anchor})
</script>
`;
