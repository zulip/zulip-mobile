/*
 * This is a GENERATED file -- do not edit.
 * To make changes:
 *   1. Edit `js.js`, which is the source for this file.
 *   2. Run `yarn run generate-webview-js`.
 */

export default `
'use strict';

var arrayFrom = function arrayFrom(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
};

if (!Element.prototype.closest) {
  Element.prototype.closest = function closest(selector) {
    var element = this;

    while (element && !element.matches(selector)) {
      element = element.parentElement;
    }

    return element;
  };
}

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
    var elementJsError = document.getElementById('js-error-detailed');

    if (elementJsError) {
      elementJsError.innerHTML = ["Message: " + message, "Source: " + source, "Line: " + line + ":" + column, "Error: " + JSON.stringify(error), ''].map(escapeHtml).join('<br>');
    }
  } else {
    var _elementJsError = document.getElementById('js-error-plain');

    var elementSheetGenerated = document.getElementById('generated-styles');
    var elementSheetHide = document.getElementById('style-hide-js-error-plain');

    if (_elementJsError && elementSheetGenerated && elementSheetHide && elementSheetHide instanceof HTMLStyleElement && elementSheetHide.sheet && elementSheetGenerated instanceof HTMLStyleElement && elementSheetGenerated.sheet) {
      elementSheetHide.sheet.disabled = true;
      var _height = _elementJsError.offsetHeight;
      elementSheetGenerated.sheet.insertRule(".header-wrapper { top: " + _height + "px; }", 0);
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

var showHideElement = function showHideElement(elementId, show) {
  var element = document.getElementById(elementId);

  if (element) {
    element.classList.toggle('hidden', !show);
  }
};

var height = documentBody.clientHeight;
window.addEventListener('resize', function (event) {
  var difference = height - documentBody.clientHeight;

  if (documentBody.scrollHeight !== documentBody.scrollTop + documentBody.clientHeight) {
    window.scrollBy({
      left: 0,
      top: difference
    });
  }

  height = documentBody.clientHeight;
});

var getMessageNode = function getMessageNode(node) {
  var curNode = node;

  while (curNode && curNode.parentNode && curNode.parentNode !== documentBody) {
    curNode = curNode.parentNode;
  }

  return curNode;
};

var getMessageIdFromNode = function getMessageIdFromNode(node) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  var msgNode = getMessageNode(node);
  return msgNode && msgNode instanceof Element ? +msgNode.getAttribute('data-msg-id') : defaultValue;
};

var getStartAndEndNodes = function getStartAndEndNodes() {
  var startNode = getMessageNode(document.elementFromPoint(200, 20));
  var endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 20));
  return {
    start: getMessageIdFromNode(startNode, Number.MAX_SAFE_INTEGER),
    end: getMessageIdFromNode(endNode, 0)
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

var scrollEventsDisabled = true;
var lastTouchEventTimestamp = 0;
var lastTouchPositionX = -1;
var lastTouchPositionY = -1;

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

var scrollToBottom = function scrollToBottom() {
  window.scroll({
    left: 0,
    top: documentBody.scrollHeight,
    behavior: 'smooth'
  });
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
  var anchorNode = document.getElementById("msg-" + anchor);

  if (anchorNode) {
    anchorNode.scrollIntoView({
      block: 'start'
    });
  } else {
    window.scroll({
      left: 0,
      top: documentBody.scrollHeight + 200
    });
  }
};

var findPreserveTarget = function findPreserveTarget() {
  var msgNode = getMessageNode(document.elementFromPoint(200, 50));

  if (!msgNode || !(msgNode instanceof HTMLElement)) {
    return {
      type: 'none'
    };
  }

  var msgId = getMessageIdFromNode(msgNode);
  var prevBoundRect = msgNode.getBoundingClientRect();
  return {
    type: 'preserve',
    msgId: msgId,
    prevBoundTop: prevBoundRect.top
  };
};

var scrollToPreserve = function scrollToPreserve(msgId, prevBoundTop) {
  var newElement = document.getElementById("msg-" + msgId);

  if (!newElement) {
    return;
  }

  var newBoundRect = newElement.getBoundingClientRect();
  window.scrollBy(0, newBoundRect.top - prevBoundTop);
};

var appendAuthToImages = function appendAuthToImages(auth) {
  var imageTags = document.getElementsByTagName('img');
  arrayFrom(imageTags).forEach(function (img) {
    if (!img.src.startsWith(auth.realm)) {
      return;
    }

    var srcPath = img.src.substring(auth.realm.length);

    if (!(srcPath.startsWith('/user_uploads/') || srcPath.startsWith('/thumbnail?'))) {
      return;
    }

    var delimiter = img.src.includes('?') ? '&' : '?';
    img.src += delimiter + "api_key=" + auth.apiKey;
  });
};

var handleMessageContent = function handleMessageContent(msg) {
  var target;

  if (msg.updateStrategy === 'replace') {
    target = {
      type: 'none'
    };
  } else if (msg.updateStrategy === 'scroll-to-anchor') {
    target = {
      type: 'anchor',
      anchor: msg.anchor
    };
  } else if (msg.updateStrategy === 'scroll-to-bottom-if-near-bottom' && isNearBottom()) {
      target = {
        type: 'bottom'
      };
    } else {
    target = findPreserveTarget();
  }

  documentBody.innerHTML = msg.content;
  appendAuthToImages(msg.auth);

  if (target.type === 'bottom') {
    scrollToBottom();
  } else if (target.type === 'anchor') {
    scrollToAnchor(target.anchor);
  } else if (target.type === 'preserve') {
    scrollToPreserve(target.msgId, target.prevBoundTop);
  }

  sendScrollMessageIfListShort();
};

var handleInitialLoad = function handleInitialLoad(anchor, auth) {
  scrollToAnchor(anchor);
  appendAuthToImages(auth);
  sendScrollMessageIfListShort();
  scrollEventsDisabled = false;
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

var handleMessageReady = function handleMessageReady(msg) {
  sendMessage({
    type: 'ready'
  });
};

var messageHandlers = {
  content: handleMessageContent,
  fetching: handleMessageFetching,
  typing: handleMessageTyping,
  ready: handleMessageReady
};
document.addEventListener('message', function (e) {
  scrollEventsDisabled = true;
  var decodedData = decodeURIComponent(escape(window.atob(e.data)));
  var messages = JSON.parse(decodedData);
  messages.forEach(function (msg) {
    messageHandlers[msg.type](msg);
  });
  scrollEventsDisabled = false;
});
documentBody.addEventListener('click', function (e) {
  e.preventDefault();
  lastTouchEventTimestamp = 0;
  var target = e.target;

  if (!(target instanceof Element)) {
    return;
  }

  if (target.matches('.scroll-bottom')) {
    scrollToBottom();
    return;
  }

  if (target.matches('.avatar-img')) {
    sendMessage({
      type: 'avatar',
      fromEmail: target.getAttribute('data-email')
    });
    return;
  }

  if (target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: target.getAttribute('data-narrow'),
      id: target.getAttribute('data-id')
    });
    return;
  }

  var inlineImageLink = target.closest('.message_inline_image a');

  if (inlineImageLink && !inlineImageLink.closest('.youtube-video, .vimeo-video')) {
    sendMessage({
      type: 'image',
      src: inlineImageLink.getAttribute('href'),
      messageId: getMessageIdFromNode(inlineImageLink)
    });
    return;
  }

  if (target.matches('a')) {
    sendMessage({
      type: 'url',
      href: target.getAttribute('href'),
      messageId: getMessageIdFromNode(target)
    });
    return;
  }

  if (target.parentNode instanceof Element && target.parentNode.matches('a')) {
    sendMessage({
      type: 'url',
      href: target.parentNode.getAttribute('href'),
      messageId: getMessageIdFromNode(target.parentNode)
    });
    return;
  }

  if (target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: target.getAttribute('data-name'),
      code: target.getAttribute('data-code'),
      reactionType: target.getAttribute('data-type'),
      messageId: getMessageIdFromNode(target),
      voted: target.classList.contains('self-voted')
    });
  }
});

var handleLongPress = function handleLongPress(target) {
  if (!lastTouchEventTimestamp || Date.now() - lastTouchEventTimestamp < 500) {
    return;
  }

  lastTouchEventTimestamp = 0;
  sendMessage({
    type: 'longPress',
    target: target.matches('.header') ? 'header' : 'message',
    messageId: getMessageIdFromNode(target)
  });
};

documentBody.addEventListener('touchstart', function (e) {
  var target = e.target;

  if (e.changedTouches[0].pageX < 20 || !(target instanceof Element)) {
    return;
  }

  lastTouchPositionX = e.changedTouches[0].pageX;
  lastTouchPositionY = e.changedTouches[0].pageY;
  lastTouchEventTimestamp = Date.now();
  setTimeout(function () {
    return handleLongPress(target);
  }, 500);
});

var isNearPositions = function isNearPositions() {
  var x1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var x2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var y2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  return Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;
};

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
