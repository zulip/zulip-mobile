/* eslint-disable */
export default `
<script>
function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

window.onerror = function(message, source, lineno, colno, error) {
  alert([
    'Message: ' + msg,
    'URL: ' + url,
    'Line: ' + lineNo,
    'Column: ' + columnNo,
    'Error object: ' + JSON.stringify(error)
  ].join(' - '));
  return false;
};

document.addEventListener('message', function(e) {
  const msg = JSON.parse(e.data);
  switch (msg.type) {
    case 'bottom':
      window.scrollTo(0, document.body.scrollHeight);
      break;
    case 'content':
      var first = document.getElementById('message-list');
      var before = document.createElement('div');
      first.innerHTML = msg.content;
    case 'spinner':
      var spinnerOlder = document.getElementById('spinner-older');
      var spinnerNewer = document.getElementById('spinner-newer');
      spinnerOlder.classList.toggle('hidden', !msg.fetchingOlder);
      spinnerNewer.classList.toggle('hidden', !msg.fetchingNewer);
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

window.addEventListener('scroll', function() {
  window.postMessage(
    JSON.stringify({
      type: 'scroll',
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      offsetHeight: document.body.offsetHeight,
    }),
    '*'
  );
  updatePinnedHeader();
});

document.body.addEventListener('click', function(e) {
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

  if (e.target.matches('a[target="_blank"] > img')) {
    sendMessage({
      type: 'image',
      src: e.target.parentNode.getAttribute('href'),
      messageId: +getMessageNode(e.target).id,
    });
  } else if (e.target.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.getAttribute('href'),
    });
  }

  if (e.target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      messageId: +getMessageNode(e.target).id,
    });
  }
});

</script>
`;
