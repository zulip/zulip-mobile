/* eslint-disable */

export default `
window.postMessage(JSON.stringify({o: 'new stuff'}));

window.addEventListener('scroll', () => {
  window.postMessage(JSON.stringify({
    type: 'scroll',
    y: window.scrollY,
    pageHeight: document.getElementsByTagName('body')[0].clientHeight
  }));
});

document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
  window.postMessage(JSON.stringify({
    type: 'click',
    targetNodeName: e.target.nodeName,
    targetClassName: e.target.className,
    matchez: e.target.matches('.avatar'),
  }));

  if (e.target && e.target.matches('.avatar-img')) {
    window.postMessage(JSON.stringify({
      type: 'avatar',
      fromEmail: e.target.getAttribute('data-email'),
    }));
  }

  if (e.target && e.target.matches('.header')) {
    window.postMessage(JSON.stringify({
      type: 'narrow',
      narrow: e.target.getAttribute('data-narrow'),
      headerType: e.target.getAttribute('data-type'),
      narrow: e.target.getAttribute('data-narrow'),
      stream: e.target.getAttribute('data-stream'),
      topic: e.target.getAttribute('data-topic'),
      recipients: e.target.getAttribute('data-recipients'),
      id: e.target.getAttribute('data-id')
    }));
  }
});

`;
