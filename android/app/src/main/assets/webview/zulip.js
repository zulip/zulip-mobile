
var documentBody = document.body;
if (!documentBody) {
  throw new Error('No document.body element!');
}

var escapeHtml = function escapeHtml(text) {
  var element = document.createElement('div');
  element.innerText = text;
  return element.innerHTML;
};

var sendMessage = function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

window.onerror = function (message, source, line, column, error) {
  if (window.enableWebViewErrorDisplay) {
    var elementJsError = document.getElementById('js-error');
    if (elementJsError) {
      elementJsError.innerHTML = ['Message: ' + message, 'Source: ' + source, 'Line: ' + line + ':' + column, 'Error: ' + JSON.stringify(error), ''].map(escapeHtml).join('<br>');
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

var showHideElement = function showHideElement(elementId, show) {
  var element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle('hidden', !show);
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
  return msgNode ? +msgNode.getAttribute('data-msg-id') : -1;
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

var prevNodes = getStartAndEndNodes();

var sendScrollMessage = function sendScrollMessage() {
  var currentNodes = getStartAndEndNodes();

  sendMessage({
    type: 'scroll',

    offsetHeight: documentBody.offsetHeight,
    innerHeight: window.innerHeight,
    scrollY: window.scrollY,
    startMessageId: Math.min(prevNodes.start, currentNodes.start),
    endMessageId: Math.max(prevNodes.end, currentNodes.end)
  });
  prevNodes = currentNodes;
};

var sendScrollMessageIfListShort = function sendScrollMessageIfListShort() {
  if (documentBody.scrollHeight === documentBody.clientHeight) {
    sendScrollMessage();
  }
};

var handleScrollEvent = function handleScrollEvent() {
  lastTouchEventTimestamp = 0;
  if (scrollEventsDisabled) {
    return;
  }

  sendScrollMessage();

  var nearEnd = documentBody.offsetHeight - window.scrollY - window.innerHeight > 100;
  showHideElement('scroll-bottom', nearEnd);
};

window.addEventListener('scroll', handleScrollEvent);

var findPreserveTarget = function findPreserveTarget() {
  var msgNode = getMessageNode(document.elementFromPoint(200, 50));
  if (!msgNode) {
    return { type: 'none' };
  }
  var msgId = getMessageIdFromNode(msgNode);
  var prevBoundRect = msgNode.getBoundingClientRect();
  return { type: 'preserve', msgId: msgId, prevBoundTop: prevBoundRect.top };
};

var scrollToPreserve = function scrollToPreserve(msgId, prevBoundTop) {
  var newElement = document.getElementById('msg-' + msgId);
  if (!newElement) {
    return;
  }
  var newBoundRect = newElement.getBoundingClientRect();
  window.scrollBy(0, newBoundRect.top - prevBoundTop);
};

var handleMessageContent = function handleMessageContent(msg) {
  var target = void 0;
  if (msg.updateStrategy === 'replace') {
    target = { type: 'none' };
  } else if (msg.updateStrategy === 'scroll-to-anchor') {
    target = { type: 'anchor', anchor: msg.anchor };
  } else if (msg.updateStrategy === 'scroll-to-bottom-if-near-bottom' && isNearBottom()) {
      target = { type: 'bottom' };
    } else {
    target = findPreserveTarget();
  }

  documentBody.innerHTML = msg.content;

  if (target.type === 'bottom') {
    scrollToBottom();
  } else if (target.type === 'anchor') {
    scrollToAnchor(target.anchor);
  } else if (target.type === 'preserve') {
    scrollToPreserve(target.msgId, target.prevBoundTop);
  }

  sendScrollMessageIfListShort();
};

var handleMessageFetching = function handleMessageFetching(msg) {
  showHideElement('message-loading', msg.showMessagePlaceholders);
  showHideElement('spinner-older', msg.fetchingOlder);
  showHideElement('spinner-newer', msg.fetchingNewer);
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

var messageHandlers = {
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
      messageId: getMessageIdFromNode(e.target)
    });
    return;
  }

  if (e.target.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.getAttribute('href'),
      messageId: getMessageIdFromNode(e.target)
    });
    return;
  }

  if (e.target.parentNode.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.parentNode.getAttribute('href'),
      messageId: getMessageIdFromNode(e.target.parentNode)
    });
    return;
  }

  if (e.target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: e.target.getAttribute('data-name'),
      code: e.target.getAttribute('data-code'),
      reactionType: e.target.getAttribute('data-type'),
      messageId: getMessageIdFromNode(e.target),
      voted: e.target.classList.contains('self-voted')
    });
  }
});

var handleLongPress = function handleLongPress(e) {
  if (!lastTouchEventTimestamp || Date.now() - lastTouchEventTimestamp < 500) {
    return;
  }

  lastTouchEventTimestamp = 0;

  sendMessage({
    type: 'longPress',
    target: e.target.matches('.header') ? 'header' : 'message',
    messageId: getMessageIdFromNode(e.target)
  });
};

documentBody.addEventListener('touchstart', function (e) {
  if (e.changedTouches[0].pageX < 20) {
    return;
  }

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

var waitForBridge = function waitForBridge() {
  if (window.postMessage.length === 1) {
    sendMessage({ type: 'ready' });
  } else {
    setTimeout(waitForBridge, 10);
  }
};
waitForBridge();