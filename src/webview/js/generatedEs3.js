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

var compiledWebviewJs = (function (exports) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var sendMessage = (function (msg) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  });

  var placeholdersDivTagFromContent = function placeholdersDivTagFromContent(content) {
    var match = new RegExp('<div id="message-loading" class="(?:hidden)?">').exec(content);
    return match !== null ? match[0] : null;
  };

  var InboundEventLogger = function () {
    _createClass(InboundEventLogger, null, [{
      key: "scrubInboundEvent",
      value: function scrubInboundEvent(event) {
        switch (event.type) {
          case 'content':
            {
              return {
                type: event.type,
                scrollMessageId: event.scrollMessageId,
                auth: 'redacted',
                content: placeholdersDivTagFromContent(event.content),
                updateStrategy: event.updateStrategy
              };
            }

          case 'fetching':
            {
              return {
                type: event.type,
                showMessagePlaceholders: event.showMessagePlaceholders,
                fetchingOlder: event.fetchingOlder,
                fetchingNewer: event.fetchingNewer
              };
            }

          case 'typing':
            {
              return {
                type: event.type,
                content: event.content !== ''
              };
            }

          case 'ready':
            {
              return {
                type: event.type
              };
            }

          case 'read':
            {
              return {
                type: event.type,
                messageIds: event.messageIds
              };
            }

          default:
            {
              return {
                type: event.type
              };
            }
        }
      }
    }]);

    function InboundEventLogger() {
      _classCallCheck(this, InboundEventLogger);

      this._isCapturing = false;
      this._capturedInboundEventItems = [];
    }

    _createClass(InboundEventLogger, [{
      key: "startCapturing",
      value: function startCapturing() {
        if (this._isCapturing) {
          throw new Error('InboundEventLogger: Tried to call startCapturing while already capturing.');
        } else if (this._capturedInboundEventItems.length > 0 || this._captureEndTime !== undefined) {
          throw new Error('InboundEventLogger: Tried to call startCapturing before resetting.');
        }

        this._isCapturing = true;
        this._captureStartTime = Date.now();
      }
    }, {
      key: "stopCapturing",
      value: function stopCapturing() {
        if (!this._isCapturing) {
          throw new Error('InboundEventLogger: Tried to call stopCapturing while not capturing.');
        }

        this._isCapturing = false;
        this._captureEndTime = Date.now();
      }
    }, {
      key: "send",
      value: function send() {
        var _this$_captureStartTi, _this$_captureEndTime;

        if (this._isCapturing) {
          throw new Error('InboundEventLogger: Tried to send captured events while still capturing.');
        }

        sendMessage({
          type: 'warn',
          details: {
            startTime: (_this$_captureStartTi = this._captureStartTime) !== null && _this$_captureStartTi !== void 0 ? _this$_captureStartTi : null,
            endTime: (_this$_captureEndTime = this._captureEndTime) !== null && _this$_captureEndTime !== void 0 ? _this$_captureEndTime : null,
            inboundEventItems: this._capturedInboundEventItems
          }
        });
      }
    }, {
      key: "reset",
      value: function reset() {
        this._captureStartTime = undefined;
        this._captureEndTime = undefined;
        this._capturedInboundEventItems = [];
        this._isCapturing = false;
      }
    }, {
      key: "maybeCaptureInboundEvent",
      value: function maybeCaptureInboundEvent(event) {
        if (this._isCapturing) {
          var item = {
            type: 'inbound',
            timestamp: Date.now(),
            scrubbedEvent: InboundEventLogger.scrubInboundEvent(event)
          };

          this._capturedInboundEventItems.push(item);
        }
      }
    }]);

    return InboundEventLogger;
  }();

  var inlineApiRoutes = ['^/user_uploads/', '^/thumbnail$', '^/avatar/'].map(function (r) {
    return new RegExp(r);
  });

  var rewriteImageUrls = function rewriteImageUrls(auth, element) {
    var realm = auth.realm;
    var imageTags = [].concat(element instanceof HTMLImageElement ? [element] : [], Array.from(element.getElementsByTagName('img')));
    imageTags.forEach(function (img) {
      var actualSrc = img.getAttribute('src');

      if (actualSrc == null) {
        return;
      }

      var fixedSrc = new URL(actualSrc, realm);

      if (fixedSrc.origin === realm.origin) {
        if (inlineApiRoutes.some(function (regexp) {
          return regexp.test(fixedSrc.pathname);
        })) {
          var delimiter = fixedSrc.search ? '&' : '';
          fixedSrc.search += "".concat(delimiter, "api_key=").concat(auth.apiKey);
        }
      }

      if (img.src !== fixedSrc.toString()) {
        img.src = fixedSrc.toString();
      }
    });
  };

  var rewriteTime = function rewriteTime(element) {
    var timeElements = [].concat(element instanceof HTMLTimeElement ? [element] : [], Array.from(element.getElementsByTagName('time')));
    timeElements.forEach(function (elem) {
      if (!(elem instanceof HTMLTimeElement)) {
        return;
      }

      var timeStamp = elem.dateTime;
      var text = elem.innerText;
      var d = new Date(timeStamp);
      elem.setAttribute('original-text', text);
      elem.innerText = "\\uD83D\\uDD52  ".concat(d.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short'
      }));
    });
  };

  var rewriteHTML = function rewriteHTML(auth) {
    var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    rewriteImageUrls(auth, element);
    rewriteTime(element);
  };

  if (!Array.from) {
    Array.from = function from(arr) {
      return Array.prototype.slice.call(arr);
    };
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

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function startsWith(search, rawPos) {
      var pos = rawPos > 0 ? rawPos | 0 : 0;
      return this.substring(pos, pos + search.length) === search;
    };
  }

  if (!String.prototype.includes) {
    String.prototype.includes = function includes(search) {
      var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return this.indexOf(search, start) !== -1;
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

  window.onerror = function (message, source, line, column, error) {
    if (window.enableWebViewErrorDisplay) {
      var elementJsError = document.getElementById('js-error-detailed');

      if (elementJsError) {
        elementJsError.innerHTML = ["Message: ".concat(message), "Source: ".concat(source), "Line: ".concat(line, ":").concat(column), "Error: ".concat(JSON.stringify(error)), ''].map(escapeHtml).join('<br>');
      }
    } else {
      var _elementJsError = document.getElementById('js-error-plain');

      var elementSheetGenerated = document.getElementById('generated-styles');
      var elementSheetHide = document.getElementById('style-hide-js-error-plain');

      if (_elementJsError && elementSheetGenerated && elementSheetHide && elementSheetHide instanceof HTMLStyleElement && elementSheetHide.sheet && elementSheetGenerated instanceof HTMLStyleElement && elementSheetGenerated.sheet) {
        elementSheetHide.sheet.disabled = true;
        var height = _elementJsError.offsetHeight;
        elementSheetGenerated.sheet.insertRule(".header-wrapper { top: ".concat(height, "px; }"), 0);
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

  var eventLogger = new InboundEventLogger();
  eventLogger.startCapturing();
  setTimeout(function () {
    var placeholdersDiv = document.getElementById('message-loading');
    eventLogger.stopCapturing();

    if (placeholdersDiv && !placeholdersDiv.classList.contains('hidden')) {
      eventLogger.send();
    }

    eventLogger.reset();
  }, 10000);

  var showHideElement = function showHideElement(elementId, show) {
    var element = document.getElementById(elementId);

    if (element) {
      element.classList.toggle('hidden', !show);
    }
  };

  var viewportHeight = documentBody.clientHeight;
  window.addEventListener('resize', function (event) {
    var heightChange = documentBody.clientHeight - viewportHeight;
    viewportHeight = documentBody.clientHeight;
    var maxScrollTop = documentBody.scrollHeight - documentBody.clientHeight;

    if (documentBody.scrollTop >= maxScrollTop - 1) {
      return;
    }

    window.scrollBy({
      left: 0,
      top: -heightChange
    });
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
    var element = document.querySelector("[data-msg-id='".concat(rangeHull.first, "']"));

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

  var scrollToMessage = function scrollToMessage(messageId) {
    var targetNode = messageId !== null ? document.getElementById("msg-".concat(messageId)) : null;

    if (targetNode) {
      targetNode.scrollIntoView({
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
    var newElement = document.getElementById("msg-".concat(msgId));

    if (!newElement) {
      return;
    }

    var newBoundRect = newElement.getBoundingClientRect();
    window.scrollBy(0, newBoundRect.top - prevBoundTop);
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
        messageId: uevent.scrollMessageId
      };
    } else if (uevent.updateStrategy === 'scroll-to-bottom-if-near-bottom' && isNearBottom()) {
        target = {
          type: 'bottom'
        };
      } else {
      target = findPreserveTarget();
    }

    documentBody.innerHTML = uevent.content;
    rewriteHTML(uevent.auth);

    if (target.type === 'bottom') {
      scrollToBottom();
    } else if (target.type === 'anchor') {
      scrollToMessage(target.messageId);
    } else if (target.type === 'preserve') {
      scrollToPreserve(target.msgId, target.prevBoundTop);
    }

    sendScrollMessageIfListShort();
  };

  var handleInitialLoad = function handleInitialLoad(platformOS, scrollMessageId, rawAuth) {
    var auth = _objectSpread2(_objectSpread2({}, rawAuth), {}, {
      realm: new URL(rawAuth.realm)
    });

    if (platformOS === 'ios') {
      window.addEventListener('message', handleMessageEvent);
    } else {
      document.addEventListener('message', handleMessageEvent);
    }

    scrollToMessage(scrollMessageId);
    rewriteHTML(auth);
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
      return "[data-msg-id=\\"".concat(id, "\\"]");
    }).join(',');
    var messageElements = Array.from(document.querySelectorAll(selector));
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
    var rawUpdateEvents = JSON.parse(decodedData);
    var updateEvents = rawUpdateEvents.map(function (updateEvent) {
      return _objectSpread2(_objectSpread2({}, updateEvent), updateEvent.auth ? {
        auth: _objectSpread2(_objectSpread2({}, updateEvent.auth), {}, {
          realm: new URL(updateEvent.auth.realm)
        })
      } : {});
    });
    updateEvents.forEach(function (uevent) {
      eventLogger.maybeCaptureInboundEvent(uevent);
      eventUpdateHandlers[uevent.type](uevent);
    });
    scrollEventsDisabled = false;
  };

  var requireAttribute = function requireAttribute(e, name) {
    var value = e.getAttribute(name);

    if (value === null || value === undefined) {
      throw new Error("Missing expected attribute ".concat(name));
    }

    return value;
  };

  var requireNumericAttribute = function requireNumericAttribute(e, name) {
    var value = requireAttribute(e, name);
    var parsedValue = parseInt(value, 10);

    if (Number.isNaN(parsedValue)) {
      throw new Error("Could not parse attribute ".concat(name, " value '").concat(value, "' as integer"));
    }

    return parsedValue;
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
        fromUserId: requireNumericAttribute(target, 'data-sender-id')
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

    if (target.matches('.user-mention')) {
      sendMessage({
        type: 'mention',
        userId: requireNumericAttribute(target, 'data-user-id')
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

    if (target.matches('time')) {
      var originalText = requireAttribute(target, 'original-text');
      sendMessage({
        type: 'time',
        originalText: originalText
      });
    }

    var messageElement = target.closest('.message-brief');

    if (messageElement) {
      messageElement.getElementsByClassName('msg-timestamp')[0].classList.toggle('show');
      return;
    }
  });

  var handleLongPress = function handleLongPress(target) {
    hasLongPressed = true;
    var reactionNode = target.closest('.reaction');

    if (reactionNode) {
      sendMessage({
        type: 'reactionDetails',
        messageId: getMessageIdFromNode(target),
        reactionName: requireAttribute(reactionNode, 'data-name')
      });
      return;
    }

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

  exports.handleInitialLoad = handleInitialLoad;

  return exports;

}({}));

`;
