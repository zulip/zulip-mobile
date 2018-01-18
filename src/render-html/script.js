/* @flow */
import smoothScroll from './smoothScroll.min';
import js from './es3';

export default (anchor: number) => `
<script>
window.__forceSmoothScrollPolyfill__ = true;
window.onerror = function (message, source, line, column, error) {
  var obj = JSON.stringify(error);
  var errorStr = ['Message: ' + message + '<br>', 'Line: ' + line + ':' + column + '<br>', 'Error: ' + obj + '<br>'].join('');
  document.getElementById('js-error').innerHTML = errorStr;
  return false;
};
${smoothScroll}
document.addEventListener('DOMContentLoaded', function() {
  ${js}
  scrollToAnchor(${anchor})
});
</script>
`;
