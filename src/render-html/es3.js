export default `
'use strict';

window.onerror = function (message, source, line, column, error) {
  var obj = JSON.stringify(error);
  var errorStr = ['Message: ' + message + '<br>', 'Line: ' + line + ':' + column + '<br>', 'Error: ' + obj + '<br>'].join('');
  document.getElementById('js-error').innerHTML = errorStr;

  return false;
};

var documentBody = document.body;
var elementSpinnerOlder = document.getElementById('spinner-older');
var elementSpinnerNewer = document.getElementById('spinner-newer');
var elementTyping = document.getElementById('typing');
var elementMessageLoading = document.getElementById('message-loading');

var scrollEventsDisabled = false;

if (!documentBody || !elementSpinnerOlder || !elementSpinnerNewer || !elementTyping || !elementMessageLoading) {
  throw new Error('HTML elements missing');
}

var sendMessage = function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

var getMessageNode = function getMessageNode(node) {
  var curNode = node;
  var previousNode = node;
  while (curNode && curNode.parentNode && curNode !== documentBody) {
    previousNode = curNode;
    curNode = curNode.parentNode;
  }
  return previousNode;
};

var getMessageIdFromNode = function getMessageIdFromNode(node) {
  var msgNode = getMessageNode(node);
  return msgNode && msgNode.getAttribute('data-msg-id');
};

var scrollToBottom = function scrollToBottom() {
  window.scroll({ left: 0, top: documentBody.scrollHeight, behavior: 'smooth' });
};

var scrollToBottomIfNearEnd = function scrollToBottomIfNearEnd() {
  if (documentBody.scrollHeight - 100 < documentBody.scrollTop + documentBody.clientHeight) {
    scrollToBottom();
  }
};

var scrollToAnchor = function scrollToAnchor(anchor) {
  var anchorNode = document.getElementById('msg-' + anchor);

  if (anchorNode) {
    anchorNode.scrollIntoView({ block: 'start' });
  } else {
    scrollToBottom();
  }
};

var height = documentBody.clientHeight;
window.addEventListener('resize', function (event) {
  var difference = height - documentBody.clientHeight;
  if (documentBody.scrollHeight !== documentBody.scrollTop + documentBody.clientHeight) {
    window.scrollBy({ left: 0, top: difference });
  }
  height = documentBody.clientHeight;
});

var handleMessageBottom = function handleMessageBottom(msg) {
  scrollToBottom();
};

var handleMessageContent = function handleMessageContent(msg) {
  var msgNode = document.getElementById('msg-' + msg.anchor);

  if (!msgNode) {
    documentBody.innerHTML = msg.content;
    scrollToAnchor(msg.anchor);
    return;
  }

  scrollEventsDisabled = true;
  var prevBoundRect = msgNode.getBoundingClientRect();
  documentBody.innerHTML = msg.content;
  var newElement = document.getElementById('msg-' + msg.anchor);
  if (newElement) {
    var newBoundRect = newElement.getBoundingClientRect();
    window.scrollBy(0, newBoundRect.top - prevBoundRect.top);
  }
  scrollEventsDisabled = false;
};

var handleMessageFetching = function handleMessageFetching(msg) {
  elementMessageLoading.classList.toggle('hidden', !msg.showMessagePlaceholders);
  elementSpinnerOlder.classList.toggle('hidden', !msg.fetchingOlder);
  elementSpinnerNewer.classList.toggle('hidden', !msg.fetchingNewer);
};

var handleMessageTyping = function handleMessageTyping(msg) {
  elementTyping.innerHTML = msg.content;
  setTimeout(function () {
    return scrollToBottomIfNearEnd();
  });
};

document.addEventListener('message', function (e) {
  var msg = JSON.parse(e.data);
  switch (msg.type) {
    case 'bottom':
      handleMessageBottom(msg);
      break;
    case 'content':
      handleMessageContent(msg);
      break;
    case 'fetching':
      handleMessageFetching(msg);
      break;
    case 'typing':
      handleMessageTyping(msg);
      break;
    default:
  }
});

window.addEventListener('scroll', function () {
  if (scrollEventsDisabled) return;

  var startNode = getMessageNode(document.elementFromPoint(200, 20));
  var endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 50));
  console.log(startNode, endNode);

  window.postMessage(JSON.stringify({
    type: 'scroll',
    scrollY: window.scrollY,
    innerHeight: window.innerHeight,
    offsetHeight: documentBody.offsetHeight
  }), '*');
});

documentBody.addEventListener('click', function (e) {
  if (e.target.matches('.avatar-img')) {
    sendMessage({
      type: 'avatar',
      fromEmail: e.target.getAttribute('data-email')
    });
  }

  if (e.target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: e.target.getAttribute('data-narrow'),
      id: e.target.getAttribute('data-id')
    });
  }

  if (e.target.matches('a[target="_blank"] > img')) {
    sendMessage({
      type: 'image',
      src: e.target.parentNode.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target)
    });
  } else if (e.target.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target)
    });
    e.preventDefault();
  }

  if (e.target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: e.target.getAttribute('data-name'),
      messageId: +getMessageIdFromNode(e.target),
      voted: e.target.classList.contains('self-voted')
    });
  }
});
`;
