/* eslint-disable */

export default `
window.addEventListener('scroll', (par) => {
  window.postMessage(JSON.stringify({
    type: 'scroll',
    y: window.scrollY,
    pageHeight: document.getElementsByTagName('body')[0].clientHeight
  }));
});
`;
