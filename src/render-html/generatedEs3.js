/*
 * This is a GENERATED file -- do not edit.
 * To make changes:
 *   1. Edit `js.js`, which is the source for this file.
 *   2. Run `yarn run generate-webview-js`.
 */

export default `
'use strict';

var scrollEventsDisabled = true;
var lastTouchEventTimestamp = 0;
var lastTouchPositionX = null;
var lastTouchPositionY = null;

var sendMessage = function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

var isNearByPositions = function isNearByPositions(x1, y1, x2, y2) {
  return x1 && y1 && x2 && y2 && Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;
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

var scrollToAnchor = function scrollToAnchor(anchor) {
  var anchorNode = document.getElementById('msg-' + anchor);

  if (anchorNode) {
    anchorNode.scrollIntoView({ block: 'start' });
  } else {
    window.scroll({ left: 0, top: document.body.scrollHeight + 200 });
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

var prevNodes = getStartAndEndNodes();

var handleScrollEvent = function handleScrollEvent() {
  lastTouchEventTimestamp = 0;
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

  var nearEnd = document.body.offsetHeight - window.scrollY - window.innerHeight > 100;
  document.getElementById('scroll-bottom').classList.toggle('hidden', !nearEnd);

  prevNodes = currentNodes;
};

var handleMessageBottom = function handleMessageBottom(msg) {
  scrollToBottom();
};

var replaceContent = function replaceContent(msg) {
  document.body.innerHTML = msg.content;
};

var updateContentAndScrollToAnchor = function updateContentAndScrollToAnchor(msg) {
  document.body.innerHTML = msg.content;
  scrollToAnchor(msg.anchor);
};

var updateContentAndScrollToBottom = function updateContentAndScrollToBottom(msg) {
  document.body.innerHTML = msg.content;
  scrollToBottom();
};

var updateContentAndPreservePosition = function updateContentAndPreservePosition(msg) {
  var msgNode = getMessageNode(document.elementFromPoint(200, 50));
  if (!msgNode) {
    document.body.innerHTML = msg.content;
  } else {
    var msgId = getMessageIdFromNode(msgNode);
    var prevBoundRect = msgNode.getBoundingClientRect();
    document.body.innerHTML = msg.content;
    var newElement = document.getElementById('msg-' + msgId);
    if (newElement) {
      var newBoundRect = newElement.getBoundingClientRect();
      window.scrollBy(0, newBoundRect.top - prevBoundRect.top);
    }
  }
};

var updateContentAndScrollToBottomIfNearBottom = function updateContentAndScrollToBottomIfNearBottom(msg) {
  if (isNearBottom()) {
    updateContentAndScrollToBottom(msg);
  } else {
    updateContentAndPreservePosition(msg);
  }
};

var updateFunctions = {
  replace: replaceContent,
  'preserve-position': updateContentAndPreservePosition,
  'scroll-to-anchor': updateContentAndScrollToAnchor,
  'scroll-to-bottom': updateContentAndScrollToBottom,
  'scroll-to-bottom-if-near-bottom': updateContentAndScrollToBottomIfNearBottom
};

var handleMessageContent = function handleMessageContent(msg) {
  scrollEventsDisabled = true;
  updateFunctions[msg.updateStrategy](msg);
  scrollEventsDisabled = false;
  if (document.body.scrollHeight < document.body.clientHeight) {
    handleScrollEvent();
  }
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

var handleLongPress = function handleLongPress(e) {
  if (!lastTouchEventTimestamp || Date.now() - lastTouchEventTimestamp < 500) return;

  lastTouchEventTimestamp = 0;

  sendMessage({
    type: 'longPress',
    target: e.target.matches('.header') ? 'header' : 'message',
    messageId: +getMessageIdFromNode(e.target)
  });
};

var messageHandlers = {
  bottom: handleMessageBottom,
  content: handleMessageContent,
  fetching: handleMessageFetching,
  typing: handleMessageTyping
};

document.addEventListener('message', function (e) {
  var msg = JSON.parse(e.data);
  messageHandlers[msg.type](msg);
});

window.addEventListener('scroll', handleScrollEvent);

document.body.addEventListener('click', function (e) {
  e.preventDefault();
  lastTouchEventTimestamp = 0;

  if (e.target.matches('.scroll-bottom')) {
    scrollToBottom();
    return;
  }

  if (e.target.matches('.avatar-img')) {
    sendMessage({
      type: 'avatar',
      fromEmail: e.target.getAttribute('data-email')
    });
    return;
  }

  if (e.target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: e.target.getAttribute('data-narrow'),
      id: e.target.getAttribute('data-id')
    });
    return;
  }

  if (e.target.matches('a[target="_blank"] > img')) {
    sendMessage({
      type: 'image',
      src: e.target.parentNode.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target)
    });
    return;
  }

  if (e.target.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target)
    });
    return;
  }

  if (e.target.parentNode.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.parentNode.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target.parentNode)
    });
    return;
  }

  if (e.target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: e.target.getAttribute('data-name'),
      code: e.target.getAttribute('data-code'),
      reactionType: e.target.getAttribute('data-type'),
      messageId: +getMessageIdFromNode(e.target),
      voted: e.target.classList.contains('self-voted')
    });
  }
});

document.body.addEventListener('touchstart', function (e) {
  if (e.changedTouches[0].pageX < 20) return;

  lastTouchPositionX = e.changedTouches[0].pageX;
  lastTouchPositionY = e.changedTouches[0].pageY;
  lastTouchEventTimestamp = Date.now();
  setTimeout(function () {
    return handleLongPress(e);
  }, 500);
});

document.body.addEventListener('touchend', function (e) {
  if (isNearByPositions(lastTouchPositionX, lastTouchPositionY, e.changedTouches[0].pageX, e.changedTouches[0].pageY)) {
    lastTouchEventTimestamp = Date.now();
  }
});

document.body.addEventListener('touchmove', function (e) {
  lastTouchEventTimestamp = 0;
});

document.body.addEventListener('drag', function (e) {
  lastTouchEventTimestamp = 0;
});
`;
