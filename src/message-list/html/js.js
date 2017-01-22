/* eslint-disable */

export default `
window.postMessage(JSON.stringify({o: 'new stuff'}));

let prevHeader;

var updatePinnedHeader = () => {
  let crNode = document.elementFromPoint(200, 40);
  while (crNode && crNode.className !== 'message') {
    crNode = crNode.parentNode;
  }

  let header = crNode;
  while (header) {
    if (header.matches && header.matches('.header')) break;
    header = header.previousSibling;
  }

  if (prevHeader && header && header !== prevHeader) {
    prevHeader.classList.remove('fixed-header');
  }

  if (header) {
    header.classList.add('fixed-header');
    prevHeader = header;
  }
}

window.addEventListener('scroll', () => {
 updatePinnedHeader();

  window.postMessage(JSON.stringify({
    type: 'scroll',
    y: window.scrollY,
    pageHeight: document.getElementsByTagName('body')[0].clientHeight,
    elementAtTop: crNode.innerHTML,
    header: header.innerHTML
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
      id: e.target.getAttribute('data-id')
    }));
  }
});

updatePinnedHeader();

`;
