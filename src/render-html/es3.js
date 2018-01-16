export default `
'use strict';

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
  while (curNode && curNode.parentNode && curNode.parentNode !== documentBody) {
    curNode = curNode.parentNode;
  }
  return curNode;
};

var getMessageIdFromNode = function getMessageIdFromNode(node) {
  var msgNode = getMessageNode(node);
  return msgNode && msgNode.getAttribute('data-msg-id');
};

var isTargetIsMessageContent = function isTargetIsMessageContent(target) {
  var curNode = target;
  while (curNode && curNode.parentNode && curNode.parentNode !== documentBody) {
    if (curNode.matches('.msg-raw-content')) return true;
    curNode = curNode.parentNode;
  }
  return false;
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

var getStartAndEndNodes = function getStartAndEndNodes() {
  var startNode = getMessageNode(document.elementFromPoint(200, 20));
  var endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 20));

  return {
    start: startNode ? startNode.getAttribute('data-msg-id') : 0,
    end: endNode ? endNode.getAttribute('data-msg-id') : 0
  };
};

var prevNodes = getStartAndEndNodes();

window.addEventListener('scroll', function () {
  if (scrollEventsDisabled) return;

  var currentNodes = getStartAndEndNodes();

  window.postMessage(JSON.stringify({
    type: 'scroll',
    scrollY: window.scrollY,
    innerHeight: window.innerHeight,
    offsetHeight: documentBody.offsetHeight,
    startMessageId: Math.min(prevNodes.start, currentNodes.start),
    endMessageId: Math.max(prevNodes.end, currentNodes.end)
  }), '*');

  prevNodes = currentNodes;
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
