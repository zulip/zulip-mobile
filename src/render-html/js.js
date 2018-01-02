/* eslint-disable func-names, no-alert, prefer-template, no-var, prefer-arrow-callback,
  space-before-function-paren */
export default `
window.onerror = function(message, source, line, column, error) {
  alert(
    [
      'Message: ' + message,
      'Source: ' + source,
      'Line: ' + line,
      'Column: ' + column,
      'Error object: ' + JSON.stringify(error),
    ].join(' - '),
  );
  return false;
};

var height = document.body.clientHeight;

function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
}

function getMessageNode(node) {
  var curNode = node;
  while (curNode && curNode.parentNode && curNode.parentNode.id !== 'message-list') {
    curNode = curNode.parentNode;
  }
  return curNode;
}

function getMessageIdFromNode(node) {
  var msgNode = getMessageNode(node);
  if (!msgNode) {
    console.log('!!!! WHOA', msgNode);
  }
  return msgNode && msgNode.getAttribute('data-msg-id');
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

window.addEventListener('resize', function(event) {
  var difference = height - document.body.clientHeight;
  if (
    difference > 0 ||
    document.body.scrollHeight !== document.body.scrollTop + document.body.clientHeight
  ) {
    window.scrollBy(0, difference);
  }
  height = document.body.clientHeight;
});

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
    case 'typing':
      document.getElementById('typing').innerHTML = msg.content;
      setTimeout(() => scrollToBottomIfNearEnd());
      break;
    default:
  }
});

window.addEventListener('scroll', function() {
  var startNode = getMessageNode(document.elementFromPoint(200, 20));
  var endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 50));
  console.log(startNode, endNode);

  window.postMessage(
    JSON.stringify({
      type: 'scroll',
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      offsetHeight: document.body.offsetHeight,
    }),
    '*',
  );
});

document.body.addEventListener('click', function(e) {
  sendMessage({
    type: 'click',
    target: e.target,
    targetNodeName: e.target.nodeName,
    targetClassName: e.target.className,
    matches: e.target.matches('a[target="_blank"] > img'),
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
      messageId: +getMessageIdFromNode(e.target),
    });
  } else if (e.target.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target),
    });
  }

  if (e.target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: e.target.getAttribute('data-name'),
      messageId: +getMessageIdFromNode(e.target),
      voted: e.target.classList.contains('self-voted'),
    });
  }

  return false;
});
`;
