/*
 * This is a GENERATED file -- do not edit.
 * To make changes:
 *   1. Edit `js.js`, which is the source for this file.
 *   2. Run `yarn run generate-webview-js`.
 */

export default `
'use strict';



var documentBody = document.body;

if (!documentBody) throw new Error('No document.body element!');

var sendMessage = function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

window.onerror = function (message, source, line, column, error) {
  if (window.enableWebViewErrorDisplay) {
    var elementJsError = document.getElementById('js-error');
    if (elementJsError) {
      elementJsError.innerHTML = ['Message: ' + message + '<br>', 'Source: ' + source + '<br>', 'Line: ' + line + ':' + column + '<br>', 'Error: ' + JSON.stringify(error) + '<br>'].join('');
    }
  }

  sendMessage({
    type: 'error',
    details: {
      message: message,
      source: source,
      line: line,
      column: column,
      error: error
    }
  });

  return true;
};

var scrollEventsDisabled = true;
var lastTouchEventTimestamp = 0;
var lastTouchPositionX = -1;
var lastTouchPositionY = -1;

var toggleElementHidden = function toggleElementHidden(elementId, hidden) {
  var element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle('hidden', hidden);
  }
};

var isNearPositions = function isNearPositions() {
  var x1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var x2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var y2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  return Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;
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

var scrollToBottom = function scrollToBottom() {
  window.scroll({ left: 0, top: documentBody.scrollHeight, behavior: 'smooth' });
};

var isNearBottom = function isNearBottom() {
  return documentBody.scrollHeight - 100 < documentBody.scrollTop + documentBody.clientHeight;
};

var scrollToBottomIfNearEnd = function scrollToBottomIfNearEnd() {
  if (isNearBottom()) {
    scrollToBottom();
  }
};

var isMessageNode = function isMessageNode(node) {
  return !!node && node.getAttribute && node.hasAttribute('data-msg-id');
};

var getStartAndEndNodes = function getStartAndEndNodes() {
  var startNode = getMessageNode(document.elementFromPoint(200, 20));
  var endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 20));

  return {
    start: isMessageNode(startNode) ? startNode.getAttribute('data-msg-id') : Number.MAX_SAFE_INTEGER,
    end: isMessageNode(endNode) ? endNode.getAttribute('data-msg-id') : 0
  };
};

var scrollToAnchor = function scrollToAnchor(anchor) {
  var anchorNode = document.getElementById('msg-' + anchor);

  if (anchorNode) {
    anchorNode.scrollIntoView({ block: 'start' });
  } else {
    window.scroll({ left: 0, top: documentBody.scrollHeight + 200 });
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

var prevNodes = getStartAndEndNodes();

var handleScrollEvent = function handleScrollEvent() {
  lastTouchEventTimestamp = 0;
  if (scrollEventsDisabled) return;

  var currentNodes = getStartAndEndNodes();

  sendMessage({
    type: 'scroll',
    scrollY: window.scrollY,
    innerHeight: window.innerHeight,
    offsetHeight: documentBody.offsetHeight,
    startMessageId: Math.min(prevNodes.start, currentNodes.start),
    endMessageId: Math.max(prevNodes.end, currentNodes.end)
  });

  var nearEnd = documentBody.offsetHeight - window.scrollY - window.innerHeight > 100;
  toggleElementHidden('scroll-bottom', !nearEnd);

  prevNodes = currentNodes;
};

var handleMessageBottom = function handleMessageBottom(msg) {
  scrollToBottom();
};

var replaceContent = function replaceContent(msg) {
  documentBody.innerHTML = msg.content;
};

var updateContentAndScrollToAnchor = function updateContentAndScrollToAnchor(msg) {
  documentBody.innerHTML = msg.content;
  scrollToAnchor(msg.anchor);
};

var updateContentAndScrollToBottom = function updateContentAndScrollToBottom(msg) {
  documentBody.innerHTML = msg.content;
  scrollToBottom();
};

var updateContentAndPreservePosition = function updateContentAndPreservePosition(msg) {
  var msgNode = getMessageNode(document.elementFromPoint(200, 50));
  if (!msgNode) {
    documentBody.innerHTML = msg.content;
  } else {
    var msgId = getMessageIdFromNode(msgNode);
    var prevBoundRect = msgNode.getBoundingClientRect();
    documentBody.innerHTML = msg.content;
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
  default: updateContentAndPreservePosition,
  'preserve-position': updateContentAndPreservePosition,
  'scroll-to-anchor': updateContentAndScrollToAnchor,
  'scroll-to-bottom': updateContentAndScrollToBottom,
  'scroll-to-bottom-if-near-bottom': updateContentAndScrollToBottomIfNearBottom
};

var handleMessageContent = function handleMessageContent(msg) {
  updateFunctions[msg.updateStrategy](msg);
  if (documentBody.scrollHeight < documentBody.clientHeight) {
    handleScrollEvent();
  }
};

var handleMessageFetching = function handleMessageFetching(msg) {
  toggleElementHidden('message-loading', !msg.showMessagePlaceholders);
  toggleElementHidden('spinner-older', !msg.fetchingOlder);
  toggleElementHidden('spinner-newer', !msg.fetchingNewer);
};

var handleMessageTyping = function handleMessageTyping(msg) {
  var elementTyping = document.getElementById('typing');
  if (elementTyping) {
    elementTyping.innerHTML = msg.content;
    setTimeout(function () {
      return scrollToBottomIfNearEnd();
    });
  }
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
  scrollEventsDisabled = true;

  var messages = JSON.parse(e.data);
  messages.forEach(function (msg) {
    messageHandlers[msg.type](msg);
  });
  scrollEventsDisabled = false;
});

window.addEventListener('scroll', handleScrollEvent);

documentBody.addEventListener('click', function (e) {
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

documentBody.addEventListener('touchstart', function (e) {
  if (e.changedTouches[0].pageX < 20) return;

  lastTouchPositionX = e.changedTouches[0].pageX;
  lastTouchPositionY = e.changedTouches[0].pageY;
  lastTouchEventTimestamp = Date.now();
  setTimeout(function () {
    return handleLongPress(e);
  }, 500);
});

documentBody.addEventListener('touchend', function (e) {
  if (isNearPositions(lastTouchPositionX, lastTouchPositionY, e.changedTouches[0].pageX, e.changedTouches[0].pageY)) {
    lastTouchEventTimestamp = Date.now();
  }
});

documentBody.addEventListener('touchmove', function (e) {
  lastTouchEventTimestamp = 0;
});

documentBody.addEventListener('drag', function (e) {
  lastTouchEventTimestamp = 0;
});
`;
