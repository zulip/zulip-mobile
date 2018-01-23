export default `
'use strict';

var scrollEventsDisabled = true;

var sendMessage = function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

var getMessageNode = function getMessageNode(node) {
  var curNode = node;
  while (curNode && curNode.parentNode && curNode.parentNode !== document.body) {
    curNode = curNode.parentNode;
  }
  return curNode;
};

var getMessageIdFromNode = function getMessageIdFromNode(node) {
  var msgNode = getMessageNode(node);
  return msgNode && msgNode.getAttribute('data-msg-id');
};

var isTargetMessageContent = function isTargetMessageContent(target) {
  var curNode = target;
  while (curNode && curNode.parentNode && curNode.parentNode !== document.body) {
    if (curNode.matches('.msg-raw-content')) return true;
    curNode = curNode.parentNode;
  }
  return false;
};

var scrollToBottom = function scrollToBottom() {
  window.scroll({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' });
};

var isNearBottom = function isNearBottom() {
  return document.body.scrollHeight - 100 < document.body.scrollTop + document.body.clientHeight;
};

var scrollToBottomIfNearEnd = function scrollToBottomIfNearEnd() {
  if (isNearBottom()) {
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

var height = document.body.clientHeight;
window.addEventListener('resize', function (event) {
  var difference = height - document.body.clientHeight;
  if (document.body.scrollHeight !== document.body.scrollTop + document.body.clientHeight) {
    window.scrollBy({ left: 0, top: difference });
  }
  height = document.body.clientHeight;
});

var handleMessageBottom = function handleMessageBottom(msg) {
  scrollToBottom();
};

var handleMessageContent = function handleMessageContent(msg) {
  var msgNode = document.getElementById('msg-' + msg.anchor);

  scrollEventsDisabled = true;
  if (isNearBottom()) {
    document.body.innerHTML = msg.content;
    scrollToBottom();
  } else if (!msgNode) {
    document.body.innerHTML = msg.content;
    scrollToAnchor(msg.anchor);
  } else {
    var prevBoundRect = msgNode.getBoundingClientRect();
    document.body.innerHTML = msg.content;
    var newElement = document.getElementById('msg-' + msg.anchor);
    if (newElement) {
      var newBoundRect = newElement.getBoundingClientRect();
      window.scrollBy(0, newBoundRect.top - prevBoundRect.top);
    }
  }
  scrollEventsDisabled = false;
};

var handleMessageFetching = function handleMessageFetching(msg) {
  document.getElementById('message-loading').classList.toggle('hidden', !msg.showMessagePlaceholders);
  document.getElementById('spinner-older').classList.toggle('hidden', !msg.fetchingOlder);
  document.getElementById('spinner-newer').classList.toggle('hidden', !msg.fetchingNewer);
};

var handleMessageTyping = function handleMessageTyping(msg) {
  document.getElementById('typing').innerHTML = msg.content;
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

var isMessageNode = function isMessageNode(node) {
  return node && node.getAttribute && node.hasAttribute('data-msg-id');
};

var getStartAndEndNodes = function getStartAndEndNodes() {
  var startNode = getMessageNode(document.elementFromPoint(200, 20));
  var endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 20));

  return {
    start: isMessageNode(startNode) ? startNode.getAttribute('data-msg-id') : 0,
    end: isMessageNode(endNode) ? endNode.getAttribute('data-msg-id') : Number.MAX_SAFE_INTEGER
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
    offsetHeight: document.body.offsetHeight,
    startMessageId: Math.min(prevNodes.start, currentNodes.start),
    endMessageId: Math.max(prevNodes.end, currentNodes.end)
  }), '*');

  prevNodes = currentNodes;
});

document.body.addEventListener('click', function (e) {
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
