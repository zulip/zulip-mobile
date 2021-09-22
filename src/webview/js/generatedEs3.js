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

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

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

  var makeUserId = function makeUserId(id) {
    return id;
  };

  var sendMessage = (function (msg) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  });

  var placeholdersDivTagFromContent = function placeholdersDivTagFromContent(content) {
    var match = new RegExp('<div id="message-loading" class="(?:hidden)?">').exec(content);
    return match !== null ? match[0] : null;
  };

  var InboundEventLogger = function () {
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
            inboundEventItems: JSON.stringify(this._capturedInboundEventItems)
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
    }], [{
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

      var fixedSrc;

      try {
        fixedSrc = new URL(actualSrc, realm);
      } catch (_unused) {
        img.src = 'about:blank';
        return;
      }

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
    if (typeof HTMLTimeElement !== 'function') {
      return;
    }

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

  var rewriteSpoilers = function rewriteSpoilers(element) {
    var spoilerHeaders = element.querySelectorAll('div.spoiler-header');
    spoilerHeaders.forEach(function (e) {
      var toggle_button_html = '<span class="spoiler-button" aria-expanded="false"><span class="spoiler-arrow"></span></span>';

      if (e.innerText === '') {
        var header_html = '<p>Spoiler</p>';
        e.innerHTML = toggle_button_html + header_html;
      } else {
        e.innerHTML = toggle_button_html + e.innerHTML;
      }
    });
  };

  var rewriteHtml = function rewriteHtml(auth) {
    var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    rewriteImageUrls(auth, element);
    rewriteTime(element);
    rewriteSpoilers(element);
  };

  var collapseSpoiler = function collapseSpoiler(spoiler) {
    var computedHeight = getComputedStyle(spoiler).height;
    requestAnimationFrame(function () {
      spoiler.style.height = computedHeight;
      spoiler.classList.remove('spoiler-content-open');
      requestAnimationFrame(function () {
        spoiler.style.height = '0px';
      });
    });
  };

  var expandSpoiler = function expandSpoiler(spoiler) {
    var spoilerHeight = spoiler.scrollHeight;
    spoiler.style.height = "".concat(spoilerHeight, "px");
    spoiler.classList.add('spoiler-content-open');

    var callback = function callback() {
      spoiler.removeEventListener('transitionend', callback);
      spoiler.style.height = '';
    };

    spoiler.addEventListener('transitionend', callback);
  };

  var toggleSpoiler = function toggleSpoiler(spoilerHeader) {
    var spoilerBlock = spoilerHeader.parentElement;

    if (!spoilerBlock) {
      return;
    }

    var button = spoilerHeader.querySelector('.spoiler-button');
    var arrow = spoilerBlock.querySelector('.spoiler-arrow');
    var spoilerContent = spoilerBlock.querySelector('.spoiler-content');

    if (!arrow || !button || !spoilerContent) {
      console.warn('Malformed spoiler block');
      return;
    }

    if (spoilerContent.classList.contains('spoiler-content-open')) {
      arrow.classList.remove('spoiler-button-open');
      button.setAttribute('aria-expanded', 'false');
      spoilerContent.setAttribute('aria-hidden', 'true');
      collapseSpoiler(spoilerContent);
    } else {
      arrow.classList.add('spoiler-button-open');
      button.setAttribute('aria-expanded', 'true');
      spoilerContent.setAttribute('aria-hidden', 'false');
      expandSpoiler(spoilerContent);
    }
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
    if (window.isDevelopment) {
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

    var userAgent = window.navigator.userAgent;
    sendMessage({
      type: 'error',
      details: {
        message,
        source,
        line,
        column,
        userAgent,
        error
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

  function midMessageListElement(top, bottom) {
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

  function previousMessage(start) {
    return walkToMessage(start.previousElementSibling, 'previousElementSibling');
  }

  function nextMessage(start) {
    return walkToMessage(start.nextElementSibling, 'nextElementSibling');
  }

  function isVisible(element, top, bottom) {
    var rect = element.getBoundingClientRect();
    return top < rect.bottom && rect.top < bottom;
  }

  var messageReadSlop = 16;

  function isRead(element, top, bottom) {
    return bottom + messageReadSlop >= element.getBoundingClientRect().bottom;
  }

  function someVisibleMessage(top, bottom) {
    function checkVisible(candidate) {
      return candidate && isVisible(candidate, top, bottom) ? candidate : null;
    }

    var midElement = midMessageListElement(top, bottom);
    return checkVisible(walkToMessage(midElement, 'previousElementSibling')) || checkVisible(walkToMessage(midElement, 'nextElementSibling')) || checkVisible(firstMessage()) || checkVisible(lastMessage());
  }

  function someVisibleReadMessage(top, bottom) {
    function checkReadAndVisible(candidate) {
      return candidate && isRead(candidate, top, bottom) && isVisible(candidate, top, bottom) ? candidate : null;
    }

    var visible = someVisibleMessage(top, bottom);

    if (!visible) {
      return visible;
    }

    return checkReadAndVisible(visible) || checkReadAndVisible(previousMessage(visible));
  }

  function idFromMessage(element) {
    var idStr = element.getAttribute('data-msg-id');

    if (idStr === null || idStr === undefined) {
      throw new Error('Bad message element');
    }

    return +idStr;
  }

  function visibleReadMessageIds() {
    var top = 0;
    var bottom = viewportHeight;
    var first = Number.MAX_SAFE_INTEGER;
    var last = 0;

    function walkElements(start, step) {
      var element = start;

      while (element && isVisible(element, top, bottom) && isRead(element, top, bottom)) {
        if (element.classList.contains('message')) {
          var id = idFromMessage(element);
          first = Math.min(first, id);
          last = Math.max(last, id);
        }

        element = element[step];
      }
    }

    var start = someVisibleReadMessage(top, bottom);
    walkElements(start, 'nextElementSibling');
    walkElements(start, 'previousElementSibling');
    return {
      first,
      last
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

  var prevMessageRange = visibleReadMessageIds();

  var sendScrollMessage = function sendScrollMessage() {
    var messageRange = visibleReadMessageIds();
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

    if (!doNotMarkMessagesAsRead) {
      setMessagesReadAttributes(rangeHull);
    }

    if (messageRange.first < messageRange.last) {
      prevMessageRange = messageRange;
    }
  };

  var sendScrollMessageIfListShort = function sendScrollMessageIfListShort() {
    if (documentBody.scrollHeight === documentBody.clientHeight) {
      sendScrollMessage();
    }
  };

  var scrollEventsDisabled = true;
  var hasLongPressed = false;
  var longPressTimeout = undefined;
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

  var runAfterLayout = function runAfterLayout(fn) {
    if (platformOS === 'android') {
      fn();
      return;
    }

    requestAnimationFrame(function () {
      fn();
    });
  };

  var handleInboundEventContent = function handleInboundEventContent(uevent) {
    var updateStrategy = uevent.updateStrategy;
    var target;

    switch (updateStrategy) {
      case 'replace':
        target = {
          type: 'none'
        };
        break;

      case 'scroll-to-anchor':
        target = {
          type: 'anchor',
          messageId: uevent.scrollMessageId
        };
        break;

      case 'scroll-to-bottom-if-near-bottom':
        target = isNearBottom() ? {
          type: 'bottom'
        } : findPreserveTarget();
        break;

      case 'preserve-position':
        target = findPreserveTarget();
        break;

      default:
        target = findPreserveTarget();
        break;
    }

    documentBody.innerHTML = uevent.content;
    rewriteHtml(uevent.auth);
    runAfterLayout(function () {
      if (target.type === 'bottom') {
        scrollToBottom();
      } else if (target.type === 'anchor') {
        scrollToMessage(target.messageId);
      } else if (target.type === 'preserve') {
        scrollToPreserve(target.msgId, target.prevBoundTop);
      }

      sendScrollMessageIfListShort();
    });
  };

  var handleInitialLoad = function handleInitialLoad(scrollMessageId, rawAuth) {
    var auth = _objectSpread2(_objectSpread2({}, rawAuth), {}, {
      realm: new URL(rawAuth.realm)
    });

    if (platformOS === 'ios') {
      window.addEventListener('message', handleMessageEvent);
    } else {
      document.addEventListener('message', handleMessageEvent);
    }

    scrollToMessage(scrollMessageId);
    rewriteHtml(auth);
    sendScrollMessageIfListShort();
    scrollEventsDisabled = false;
  };

  var handleInboundEventFetching = function handleInboundEventFetching(uevent) {
    showHideElement('message-loading', uevent.showMessagePlaceholders);
    showHideElement('spinner-older', uevent.fetchingOlder);
    showHideElement('spinner-newer', uevent.fetchingNewer);
  };

  var handleInboundEventTyping = function handleInboundEventTyping(uevent) {
    var elementTyping = document.getElementById('typing');

    if (elementTyping) {
      elementTyping.innerHTML = uevent.content;
      runAfterLayout(function () {
        return scrollToBottomIfNearEnd();
      });
    }
  };

  var readyRetryInterval = undefined;

  var signalReadyForEvents = function signalReadyForEvents() {
    sendMessage({
      type: 'ready'
    });
    readyRetryInterval = setInterval(function () {
      sendMessage({
        type: 'ready'
      });
    }, 100);
  };

  var handleInboundEventReady = function handleInboundEventReady(uevent) {
    clearInterval(readyRetryInterval);
  };

  var handleInboundEventMessagesRead = function handleInboundEventMessagesRead(uevent) {
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

  var inboundEventHandlers = {
    content: handleInboundEventContent,
    fetching: handleInboundEventFetching,
    typing: handleInboundEventTyping,
    ready: handleInboundEventReady,
    read: handleInboundEventMessagesRead
  };

  var handleMessageEvent = function handleMessageEvent(e) {
    scrollEventsDisabled = true;
    var decodedData = decodeURIComponent(escape(window.atob(e.data)));
    var rawInboundEvents = JSON.parse(decodedData);
    var inboundEvents = rawInboundEvents.map(function (inboundEvent) {
      return _objectSpread2(_objectSpread2({}, inboundEvent), inboundEvent.auth ? {
        auth: _objectSpread2(_objectSpread2({}, inboundEvent.auth), {}, {
          realm: new URL(inboundEvent.auth.realm)
        })
      } : {});
    });
    inboundEvents.forEach(function (uevent) {
      eventLogger.maybeCaptureInboundEvent(uevent);
      inboundEventHandlers[uevent.type](uevent);
    });
    scrollEventsDisabled = false;
  };

  var revealMutedMessages = function revealMutedMessages(message) {
    var messageNode = message;

    do {
      messageNode.setAttribute('data-mute-state', 'shown');
      messageNode = nextMessage(messageNode);
    } while (messageNode && messageNode.classList.contains('message-brief'));
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
        fromUserId: makeUserId(requireNumericAttribute(target, 'data-sender-id'))
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
        userId: makeUserId(requireNumericAttribute(target, 'data-user-id'))
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

    if (target.matches('.poll-vote')) {
      var _messageElement = target.closest('.message');

      if (!_messageElement) {
        throw new Error('Message element not found');
      }

      var current_vote = requireAttribute(target, 'data-voted') === 'true';
      var vote = current_vote ? -1 : 1;
      sendMessage({
        type: 'vote',
        messageId: requireNumericAttribute(_messageElement, 'data-msg-id'),
        key: requireAttribute(target, 'data-key'),
        vote
      });
      target.setAttribute('data-voted', (!current_vote).toString());
      target.innerText = (parseInt(target.innerText, 10) + vote).toString();
      return;
    }

    if (target.matches('time')) {
      var originalText = requireAttribute(target, 'original-text');
      sendMessage({
        type: 'time',
        originalText
      });
    }

    var spoilerHeader = target.closest('.spoiler-header');

    if (spoilerHeader instanceof HTMLElement) {
      toggleSpoiler(spoilerHeader);
      return;
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

    var targetType = target.matches('.header') ? 'header' : target.matches('a') ? 'link' : 'message';
    var messageNode = target.closest('.message');

    if (targetType === 'message' && messageNode && messageNode.getAttribute('data-mute-state') === 'hidden') {
      revealMutedMessages(messageNode);
      return;
    }

    sendMessage({
      type: 'longPress',
      target: targetType,
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
  signalReadyForEvents();

  exports.handleInitialLoad = handleInitialLoad;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));

`;
