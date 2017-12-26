/* eslint-disable */
export default `
<script>
function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
}

function getMessageNode(node) {
  let crNode = node;
  while (crNode && crNode.className !== 'message') {
    crNode = crNode.parentNode;
  }
  return crNode;
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

function scrollToBottomIfNearEnd() {
  if (document.body.scrollHeight - 100 < document.body.scrollTop + document.body.clientHeight) {
    scrollToBottom();
  }
}

function scrollToAnchor(anchor) {
  var anchorNode = document.getElementById('msg-' + anchor);
  if (anchorNode) {
    anchorNode.scrollIntoView(false);
  } else {
    scrollToBottom();
  }
}


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
      var first = document.getElementById('message-list');
      var before = document.createElement('div');
      first.innerHTML = msg.content;

      scrollToAnchor(msg.anchor);
      break;
    case 'fetching':
      document.getElementById('spinner-older').classList.toggle('hidden', !msg.fetchingOlder);
      document.getElementById('spinner-newer').classList.toggle('hidden', !msg.fetchingNewer);
      break;
    case 'typing':
      var node = document.getElementById('typing');
      node.innerHTML = msg.content;
      setTimeout(() => scrollToBottomIfNearEnd());
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
