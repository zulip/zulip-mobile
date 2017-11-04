/* eslint-disable */

export default `
document.addEventListener('message', function(e) {
  const msg = JSON.parse(e.data);
  switch (msgObj.type) {
    case 'bottom':
      window.scrollTo(0, document.body.scrollHeight);
      break;
    case 'messages':
      let first = document.body.children[0];
      let before = document.createElement('div');
      before.innerHTML = msgObj.html;
      document.body.insertBefore(before, first);
      break;
  }
});

let prevHeader;

const updatePinnedHeader = () => {
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
};

window.addEventListener('scroll', () => {
  window.postMessage(
    JSON.stringify({
      type: 'scroll',
      y: window.scrollY,
    }),
  );
  updatePinnedHeader();
});

document.getElementsByTagName('body')[0].addEventListener('click', e => {
  // if !(e.target)
  window.postMessage(
    JSON.stringify({
      type: 'click',
      target: e.traget,
      targetNodeName: e.target.nodeName,
      targetClassName: e.target.className,
      matchez: e.target.matches('a[target="_blank"] > img'),
    }),
  );

  if (e.target.matches('.avatar-img')) {
    window.postMessage(
      JSON.stringify({
        type: 'avatar',
        fromEmail: e.target.getAttribute('data-email'),
      }),
    );
  }

  if (e.target.matches('.header')) {
    window.postMessage(
      JSON.stringify({
        type: 'narrow',
        narrow: e.target.getAttribute('data-narrow'),
        id: e.target.getAttribute('data-id'),
      }),
    );
  }

  if (e.target.matches('a[target="_blank"]')) {
    window.postMessage(
      JSON.stringify({
        type: 'image',
        src: e.target.getAttribute('href'),
        message: e.target.getAttribute('data-id'),
      }),
    );
  }

  if (e.target.matches('a[target="_blank"] > img')) {
    window.postMessage(
      JSON.stringify({
        type: 'image',
        src: e.target.parentNode.getAttribute('href'),
        message: e.target.getAttribute('data-id'),
      }),
    );
  }
});

updatePinnedHeader();

`;
