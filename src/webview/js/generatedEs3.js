/*
 * This is a GENERATED file -- do not edit.
 * To make changes:
 *   1. Edit `js.js`, which is the source for this file.
 *   2. Run `tools/generate-webview-js`.
 *
 * @generated
 * @flow strict
 */

export default `
'use strict';

function arrayFrom(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
}

function arrayFromNodes(arrayLike) {
  return Array.prototype.slice.call(arrayLike);
}

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
  window.ReactNativeWebView.postMessage(JSON.stringify(msg));
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
      var height = _elementJsError.offsetHeight;
      elementSheetGenerated.sheet.insertRule(".header-wrapper { top: " + height + "px; }", 0);
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

var viewportHeight = documentBody.clientHeight;
window.addEventListener('resize', function (event) {
  var difference = viewportHeight - documentBody.clientHeight;

  if (documentBody.scrollHeight !== documentBody.scrollTop + documentBody.clientHeight) {
    window.scrollBy({
      left: 0,
      top: difference
    });
  }

  viewportHeight = documentBody.clientHeight;
});

function midMessagePeer(top, bottom) {
  var midY = (bottom + top) / 2;

  if (document.elementsFromPoint === undefined) {
    var element = document.elementFromPoint(0, midY);
    return element && element.closest('body > *');
  }

  var midElements = document.elementsFromPoint(0, midY);

  if (midElements.length < 3) {
    return null;
  }

  return midElements[midElements.length - 3];
}

function walkToMessage(start, step) {
  var element = start;

  while (element && !element.classList.contains('message')) {
    element = element[step];
  }

  return element;
}

function firstMessage() {
  return walkToMessage(documentBody.firstElementChild, 'nextElementSibling');
}

function lastMessage() {
  return walkToMessage(documentBody.lastElementChild, 'previousElementSibling');
}

var minOverlap = 20;

function isVisible(element, top, bottom) {
  var rect = element.getBoundingClientRect();
  return top + minOverlap < rect.bottom && rect.top + minOverlap < bottom;
}

function someVisibleMessage(top, bottom) {
  function checkVisible(candidate) {
    return candidate && isVisible(candidate, top, bottom) ? candidate : null;
  }

  var midPeer = midMessagePeer(top, bottom);
  return checkVisible(walkToMessage(midPeer, 'previousElementSibling')) || checkVisible(walkToMessage(midPeer, 'nextElementSibling')) || checkVisible(firstMessage()) || checkVisible(lastMessage());
}

function idFromMessage(element) {
  var idStr = element.getAttribute('data-msg-id');

  if (idStr === null || idStr === undefined) {
    throw new Error('Bad message element');
  }

  return +idStr;
}

function visibleMessageIds() {
  var top = 0;
  var bottom = viewportHeight;
  var first = Number.MAX_SAFE_INTEGER;
  var last = 0;

  function walkElements(start, step) {
    var element = start;

    while (element && isVisible(element, top, bottom)) {
      if (element.classList.contains('message')) {
        var id = idFromMessage(element);
        first = Math.min(first, id);
        last = Math.max(last, id);
      }

      element = element[step];
    }
  }

  var start = someVisibleMessage(top, bottom);
  walkElements(start, 'nextElementSibling');
  walkElements(start, 'previousElementSibling');
  return {
    first: first,
    last: last
  };
}

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

var setMessagesReadAttributes = function setMessagesReadAttributes(rangeHull) {
  var element = document.querySelector("[data-msg-id='" + rangeHull.first + "']");

  while (element) {
    if (element.classList.contains('message')) {
      element.setAttribute('data-read', 'true');

      if (idFromMessage(element) >= rangeHull.last) {
        break;
      }
    }

    element = element.nextElementSibling;
  }
};

var prevMessageRange = visibleMessageIds();

var sendScrollMessage = function sendScrollMessage() {
  var messageRange = visibleMessageIds();
  var rangeHull = {
    first: Math.min(prevMessageRange.first, messageRange.first),
    last: Math.max(prevMessageRange.last, messageRange.last)
  };
  sendMessage({
    type: 'scroll',
    offsetHeight: documentBody.offsetHeight,
    innerHeight: window.innerHeight,
    scrollY: window.scrollY,
    startMessageId: rangeHull.first,
    endMessageId: rangeHull.last
  });
  setMessagesReadAttributes(rangeHull);
  prevMessageRange = messageRange;
};

var sendScrollMessageIfListShort = function sendScrollMessageIfListShort() {
  if (documentBody.scrollHeight === documentBody.clientHeight) {
    sendScrollMessage();
  }
};

var scrollEventsDisabled = true;
var hasLongPressed = false;
var longPressTimeout;
var lastTouchPositionX = -1;
var lastTouchPositionY = -1;

var handleScrollEvent = function handleScrollEvent() {
  clearTimeout(longPressTimeout);

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
  var message = someVisibleMessage(0, viewportHeight);

  if (!message) {
    return {
      type: 'none'
    };
  }

  var messageId = idFromMessage(message);
  var prevBoundRect = message.getBoundingClientRect();
  return {
    type: 'preserve',
    msgId: messageId,
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

    if (!(srcPath.startsWith('/user_uploads/') || srcPath.startsWith('/thumbnail?') || srcPath.startsWith('/avatar/'))) {
      return;
    }

    var delimiter = img.src.includes('?') ? '&' : '?';
    img.src += delimiter + "api_key=" + auth.apiKey;
  });
};

var handleUpdateEventContent = function handleUpdateEventContent(uevent) {
  var target;

  if (uevent.updateStrategy === 'replace') {
    target = {
      type: 'none'
    };
  } else if (uevent.updateStrategy === 'scroll-to-anchor') {
    target = {
      type: 'anchor',
      anchor: uevent.anchor
    };
  } else if (uevent.updateStrategy === 'scroll-to-bottom-if-near-bottom' && isNearBottom()) {
      target = {
        type: 'bottom'
      };
    } else {
    target = findPreserveTarget();
  }

  documentBody.innerHTML = uevent.content;
  appendAuthToImages(uevent.auth);

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

var handleUpdateEventFetching = function handleUpdateEventFetching(uevent) {
  showHideElement('message-loading', uevent.showMessagePlaceholders);
  showHideElement('spinner-older', uevent.fetchingOlder);
  showHideElement('spinner-newer', uevent.fetchingNewer);
};

var handleUpdateEventTyping = function handleUpdateEventTyping(uevent) {
  var elementTyping = document.getElementById('typing');

  if (elementTyping) {
    elementTyping.innerHTML = uevent.content;
    setTimeout(function () {
      return scrollToBottomIfNearEnd();
    });
  }
};

var handleUpdateEventReady = function handleUpdateEventReady(uevent) {
  sendMessage({
    type: 'ready'
  });
};

var handleUpdateEventMessagesRead = function handleUpdateEventMessagesRead(uevent) {
  if (uevent.messageIds.length === 0) {
    return;
  }

  var selector = uevent.messageIds.map(function (id) {
    return "[data-msg-id=\\"" + id + "\\"]";
  }).join(',');
  var messageElements = arrayFromNodes(document.querySelectorAll(selector));
  messageElements.forEach(function (element) {
    element.setAttribute('data-read', 'true');
  });
};

var eventUpdateHandlers = {
  content: handleUpdateEventContent,
  fetching: handleUpdateEventFetching,
  typing: handleUpdateEventTyping,
  ready: handleUpdateEventReady,
  read: handleUpdateEventMessagesRead
};

var handleMessageEvent = function handleMessageEvent(e) {
  scrollEventsDisabled = true;
  var decodedData = decodeURIComponent(escape(window.atob(e.data)));
  var updateEvents = JSON.parse(decodedData);
  updateEvents.forEach(function (uevent) {
    eventUpdateHandlers[uevent.type](uevent);
  });
  scrollEventsDisabled = false;
};

if (isIos) {
  window.addEventListener('message', handleMessageEvent);
} else {
  document.addEventListener('message', handleMessageEvent);
}

var requireAttribute = function requireAttribute(e, name) {
  var value = e.getAttribute(name);

  if (value === null || value === undefined) {
    throw new Error("Missing expected attribute " + name);
  }

  return value;
};

documentBody.addEventListener('click', function (e) {
  e.preventDefault();
  clearTimeout(longPressTimeout);

  if (hasLongPressed) {
    hasLongPressed = false;
    return;
  }

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
      fromEmail: requireAttribute(target, 'data-email')
    });
    return;
  }

  if (target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: requireAttribute(target, 'data-narrow')
    });
    return;
  }

  var inlineImageLink = target.closest('.message_inline_image a');

  if (inlineImageLink && !inlineImageLink.closest('.youtube-video, .vimeo-video')) {
    sendMessage({
      type: 'image',
      src: requireAttribute(inlineImageLink, 'href'),
      messageId: getMessageIdFromNode(inlineImageLink)
    });
    return;
  }

  if (target.matches('a')) {
    sendMessage({
      type: 'url',
      href: requireAttribute(target, 'href'),
      messageId: getMessageIdFromNode(target)
    });
    return;
  }

  if (target.parentNode instanceof Element && target.parentNode.matches('a')) {
    sendMessage({
      type: 'url',
      href: requireAttribute(target.parentNode, 'href'),
      messageId: getMessageIdFromNode(target.parentNode)
    });
    return;
  }

  if (target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: requireAttribute(target, 'data-name'),
      code: requireAttribute(target, 'data-code'),
      reactionType: requireAttribute(target, 'data-type'),
      messageId: getMessageIdFromNode(target),
      voted: target.classList.contains('self-voted')
    });
    return;
  }

  var messageElement = target.closest('.message-brief');

  if (messageElement) {
    messageElement.getElementsByClassName('timestamp')[0].classList.toggle('show');
    return;
  }
});

var handleLongPress = function handleLongPress(target) {
  hasLongPressed = true;
  sendMessage({
    type: 'longPress',
    target: target.matches('.header') ? 'header' : target.matches('a') ? 'link' : 'message',
    messageId: getMessageIdFromNode(target),
    href: target.matches('a') ? requireAttribute(target, 'href') : null
  });
};

documentBody.addEventListener('touchstart', function (e) {
  var target = e.target;

  if (e.changedTouches[0].pageX < 20 || !(target instanceof Element)) {
    return;
  }

  lastTouchPositionX = e.changedTouches[0].pageX;
  lastTouchPositionY = e.changedTouches[0].pageY;
  hasLongPressed = false;
  clearTimeout(longPressTimeout);
  longPressTimeout = setTimeout(function () {
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
    clearTimeout(longPressTimeout);
  }
});
documentBody.addEventListener('touchcancel', function (e) {
  clearTimeout(longPressTimeout);
});
documentBody.addEventListener('touchmove', function (e) {
  clearTimeout(longPressTimeout);
});
documentBody.addEventListener('drag', function (e) {
  clearTimeout(longPressTimeout);
});
`;
