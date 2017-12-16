/* eslint-disable */

export default `
window.onerror = function(message){
   alert('error');
   return false;
 };

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

function getMessageNode(node) {
  let crNode = node;
  while (crNode && crNode.className !== 'message') {
    crNode = crNode.parentNode;
  }
  return crNode;
};

function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

let prevHeader;

function updatePinnedHeader() {
  return;
  let crNode = getMessageNode(document.elementFromPoint(200, 40));

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

window.addEventListener('scroll', function() {
  window.postMessage(
    JSON.stringify({
      type: 'scroll',
      y: window.scrollY,
    }),
    '*'
  );
  updatePinnedHeader();
});

document.body.addEventListener('click', function(e) {
  alert(e.target);
  sendMessage({
    type: 'click',
    target: e.traget,
    targetNodeName: e.target.nodeName,
    targetClassName: e.target.className,
    matchez: e.target.matches('a[target="_blank"] > img'),
  });

  if (e.target.matches('.avatar-img')) {
    sendMessage({
      type: 'avatar',
      fromEmail: e.target.getAttribute('data-email'),
    });
  }

  if (e.target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: e.target.getAttribute('data-narrow'),
      id: e.target.getAttribute('data-id'),
    });
  }

  if (e.target.matches('a[target="_blank"]')) {
    sendMessage({
      type: 'image',
      src: e.target.getAttribute('href'),
      messageId: +getMessageNode(e.target).id,
    });
  }

  if (e.target.matches('a[target="_blank"] > img')) {
    sendMessage({
      type: 'image',
      src: e.target.parentNode.getAttribute('href'),
      messageId: +getMessageNode(e.target).id,
    });
  }

  if (e.target.matches('.reaction')) {
    alert('match');
    sendMessage({
      type: 'reaction',
      messageId: +getMessageNode(e.target).id,
    });
  }
});

updatePinnedHeader();
`;
