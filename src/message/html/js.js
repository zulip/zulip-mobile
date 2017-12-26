/* eslint-disable */
export default `
<script>
function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

function getMessageNode(node) {
  let crNode = node;
  while (crNode && crNode.className !== 'message') {
    crNode = crNode.parentNode;
  }
  return crNode;
};

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
};

function scrollToAnchor(anchor) {
  var anchorNode = document.getElementById('msg-' + anchor);
  if (anchorNode) {
    anchorNode.scrollIntoView(false);
  } else {
    scrollToBottom();
  }
};

window.onerror = function(message, source, line, column, error) {
  alert(
    [
      'Message: ' + message,
      'Source: ' + source,
      'Line: ' + line,
      'Column: ' + column,
      'Error object: ' + JSON.stringify(error),
    ].join(' - ')
  );
  return false;
};

document.addEventListener('message', function(e) {
  const msg = JSON.parse(e.data);
  switch (msg.type) {
    case 'bottom':
      scrollToBottom();
      break;
    case 'content':
      document.getElementById('message-list').innerHTML = msg.content;
      scrollToAnchor(msg.anchor);
      break;
    case 'fetching':
      document.getElementById('spinner-older').classList.toggle('hidden', !msg.fetchingOlder);
      document.getElementById('spinner-newer').classList.toggle('hidden', !msg.fetchingNewer);
      break;
    case 'bottom-messages':
      let newContent = document.createElement('div');
      newContent.innerHTML = msg.content;
      document.getElementById('message-list').appendChild(newContent);
      break;
    case 'update-message':
      document.getElementById('msg-' + msg.id + '-content').innerHTML = msg.content;
      break;
    case 'update-message-tags':
      document.getElementById('msg-' + msg.id + '-tags').innerHTML = msg.content;
      break;
  }
});

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
      messageId: +getMessageNode(e.target).id,
    });
  }

  if (e.target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: e.target.getAttribute('data-name'),
      messageId: +getMessageNode(e.target).id,
      voted: e.target.classList.contains('self-voted'),
    });
  }
});
</script>
`;
