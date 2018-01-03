/* @flow */
import css from './css';
import js from './js-es3';
import messageLoadingList from './messageLoadingListAsHtml';

export default (content: string, theme: string) => `
${css(theme)}

<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<body>
  ${messageLoadingList}
  <div id="spinner-older" class="hidden loading-spinner"></div>
  <div id="message-list">${content}</div>
  <div id="spinner-newer" class="hidden loading-spinner"></div>
  <div id="typing" class="message"></div>
  <div id="message-loading class="hidden"></div>
</body>

<script>
${js}
</script>
`;
