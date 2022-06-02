/*
 * This is a GENERATED file -- do not edit.
 * To make changes:
 *   1. Edit `js.js` or the files it imports, which together make up
 *      the source for this file.
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
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
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

  const makeUserId = id => id;

  var sendMessage = (msg => {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  });

  const placeholdersDivTagFromContent = content => {
    const match = /<div id="message-loading" class="(?:hidden)?">/.exec(content);
    return match !== null ? match[0] : null;
  };

  class InboundEventLogger {
    static scrubInboundEvent(event) {
      switch (event.type) {
        case 'content':
          {
            return {
              type: event.type,
              scrollMessageId: event.scrollMessageId,
              auth: 'redacted',
              content: placeholdersDivTagFromContent(event.content),
              scrollStrategy: event.scrollStrategy
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

    constructor() {
      this._isCapturing = false;
      this._capturedInboundEventItems = [];
    }

    startCapturing() {
      if (this._isCapturing) {
        throw new Error('InboundEventLogger: Tried to call startCapturing while already capturing.');
      } else if (this._capturedInboundEventItems.length > 0 || this._captureEndTime !== undefined) {
        throw new Error('InboundEventLogger: Tried to call startCapturing before resetting.');
      }

      this._isCapturing = true;
      this._captureStartTime = Date.now();
    }

    stopCapturing() {
      if (!this._isCapturing) {
        throw new Error('InboundEventLogger: Tried to call stopCapturing while not capturing.');
      }

      this._isCapturing = false;
      this._captureEndTime = Date.now();
    }

    send() {
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

    reset() {
      this._captureStartTime = undefined;
      this._captureEndTime = undefined;
      this._capturedInboundEventItems = [];
      this._isCapturing = false;
    }

    maybeCaptureInboundEvent(event) {
      if (this._isCapturing) {
        const item = {
          type: 'inbound',
          timestamp: Date.now(),
          scrubbedEvent: InboundEventLogger.scrubInboundEvent(event)
        };

        this._capturedInboundEventItems.push(item);
      }
    }

  }

  const inlineApiRoutes = ['^/user_uploads/', '^/thumbnail$', '^/avatar/'].map(r => new RegExp(r));

  const rewriteImageUrls = (auth, element) => {
    const realm = auth.realm;
    const imageTags = [].concat(element instanceof HTMLImageElement ? [element] : [], Array.from(element.getElementsByTagName('img')));
    imageTags.forEach(img => {
      const actualSrc = img.getAttribute('src');

      if (actualSrc == null) {
        return;
      }

      let fixedSrc;

      try {
        fixedSrc = new URL(actualSrc, realm);
      } catch (_unused) {
        img.src = 'about:blank';
        return;
      }

      if (fixedSrc.origin === realm.origin) {
        if (inlineApiRoutes.some(regexp => regexp.test(fixedSrc.pathname))) {
          const delimiter = fixedSrc.search ? '&' : '';
          fixedSrc.search += "".concat(delimiter, "api_key=").concat(auth.apiKey);
        }
      }

      if (img.src !== fixedSrc.toString()) {
        img.src = fixedSrc.toString();
      }
    });
  };

  const rewriteTime = element => {
    if (typeof HTMLTimeElement !== 'function') {
      return;
    }

    const timeElements = [].concat(element instanceof HTMLTimeElement ? [element] : [], Array.from(element.getElementsByTagName('time')));
    timeElements.forEach(elem => {
      if (!(elem instanceof HTMLTimeElement)) {
        return;
      }

      const timeStamp = elem.dateTime;
      const text = elem.innerText;
      const d = new Date(timeStamp);
      elem.setAttribute('original-text', text);
      elem.innerText = "\\uD83D\\uDD52  ".concat(d.toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short'
      }));
    });
  };

  const rewriteSpoilers = element => {
    const spoilerHeaders = element.querySelectorAll('div.spoiler-header');
    spoilerHeaders.forEach(e => {
      const toggle_button_html = '<span class="spoiler-button" aria-expanded="false"><span class="spoiler-arrow"></span></span>';

      if (e.innerText === '') {
        const header_html = '<p>Spoiler</p>';
        e.innerHTML = toggle_button_html + header_html;
      } else {
        e.innerHTML = toggle_button_html + e.innerHTML;
      }
    });
  };

  const rewriteHtml = function (auth) {
    let element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
    rewriteImageUrls(auth, element);
    rewriteTime(element);
    rewriteSpoilers(element);
  };

  const collapseSpoiler = spoiler => {
    const computedHeight = getComputedStyle(spoiler).height;
    requestAnimationFrame(() => {
      spoiler.style.height = computedHeight;
      spoiler.classList.remove('spoiler-content-open');
      requestAnimationFrame(() => {
        spoiler.style.height = '0px';
      });
    });
  };

  const expandSpoiler = spoiler => {
    const spoilerHeight = spoiler.scrollHeight;
    spoiler.style.height = "".concat(spoilerHeight, "px");
    spoiler.classList.add('spoiler-content-open');

    const callback = () => {
      spoiler.removeEventListener('transitionend', callback);
      spoiler.style.height = '';
    };

    spoiler.addEventListener('transitionend', callback);
  };

  const toggleSpoiler = spoilerHeader => {
    const spoilerBlock = spoilerHeader.parentElement;

    if (!spoilerBlock) {
      return;
    }

    const button = spoilerHeader.querySelector('.spoiler-button');
    const arrow = spoilerBlock.querySelector('.spoiler-arrow');
    const spoilerContent = spoilerBlock.querySelector('.spoiler-content');

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

  const documentBody = document.body;

  if (!documentBody) {
    throw new Error('No document.body element!');
  }

  const msglistElementsDiv = document.querySelector('div#msglist-elements');

  if (!msglistElementsDiv) {
    throw new Error('No div#msglist-elements element!');
  }

  const escapeHtml = text => {
    const element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
  };

  window.onerror = (message, source, line, column, error) => {
    if (isDevelopment) {
      const elementJsError = document.getElementById('js-error-detailed');

      if (elementJsError) {
        elementJsError.innerHTML = ["Message: ".concat(message), "Source: ".concat(source), "Line: ".concat(line, ":").concat(column), "Error: ".concat(JSON.stringify(error)), ''].map(escapeHtml).join('<br>');
      }
    } else {
      const elementJsError = document.getElementById('js-error-plain');
      const elementSheetGenerated = document.getElementById('generated-styles');
      const elementSheetHide = document.getElementById('style-hide-js-error-plain');

      if (elementJsError && elementSheetGenerated && elementSheetHide && elementSheetHide instanceof HTMLStyleElement && elementSheetHide.sheet && elementSheetGenerated instanceof HTMLStyleElement && elementSheetGenerated.sheet) {
        elementSheetHide.sheet.disabled = true;
        const height = elementJsError.offsetHeight;
        elementSheetGenerated.sheet.insertRule(".header-wrapper { top: ".concat(height, "px; }"), 0);
      }
    }

    const userAgent = window.navigator.userAgent;
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

  const eventLogger = new InboundEventLogger();
  eventLogger.startCapturing();
  setTimeout(() => {
    const placeholdersDiv = document.getElementById('message-loading');
    eventLogger.stopCapturing();

    if (placeholdersDiv && !placeholdersDiv.classList.contains('hidden')) {
      eventLogger.send();
    }

    eventLogger.reset();
  }, 10000);

  const showHideElement = (elementId, show) => {
    const element = document.getElementById(elementId);

    if (element) {
      element.classList.toggle('hidden', !show);
    }
  };

  let viewportHeight = documentBody.clientHeight;
  window.addEventListener('resize', event => {
    const heightChange = documentBody.clientHeight - viewportHeight;
    viewportHeight = documentBody.clientHeight;
    const maxScrollTop = documentBody.scrollHeight - documentBody.clientHeight;

    if (documentBody.scrollTop >= maxScrollTop - 1) {
      return;
    }

    window.scrollBy({
      left: 0,
      top: -heightChange
    });
  });

  function midMessageListElement(top, bottom) {
    const midY = (bottom + top) / 2;
    const midElements = document.elementsFromPoint(0, midY);

    if (midElements.length < 4) {
      return null;
    }

    return midElements[midElements.length - 4];
  }

  function walkToMessage(start, step) {
    let element = start;

    while (element && !element.classList.contains('message')) {
      element = element[step];
    }

    return element;
  }

  function firstMessage() {
    return walkToMessage(msglistElementsDiv.firstElementChild, 'nextElementSibling');
  }

  function lastMessage() {
    return walkToMessage(msglistElementsDiv.lastElementChild, 'previousElementSibling');
  }

  function previousMessage(start) {
    return walkToMessage(start.previousElementSibling, 'previousElementSibling');
  }

  function nextMessage(start) {
    return walkToMessage(start.nextElementSibling, 'nextElementSibling');
  }

  function isVisible(element, top, bottom) {
    const rect = element.getBoundingClientRect();
    return top < rect.bottom && rect.top < bottom;
  }

  const messageReadSlop = 16;

  function isRead(element, top, bottom) {
    return bottom + messageReadSlop >= element.getBoundingClientRect().bottom;
  }

  function someVisibleMessage(top, bottom) {
    function checkVisible(candidate) {
      return candidate && isVisible(candidate, top, bottom) ? candidate : null;
    }

    const midElement = midMessageListElement(top, bottom);
    return checkVisible(walkToMessage(midElement, 'previousElementSibling')) || checkVisible(walkToMessage(midElement, 'nextElementSibling')) || checkVisible(firstMessage()) || checkVisible(lastMessage());
  }

  function someVisibleReadMessage(top, bottom) {
    function checkReadAndVisible(candidate) {
      return candidate && isRead(candidate, top, bottom) && isVisible(candidate, top, bottom) ? candidate : null;
    }

    const visible = someVisibleMessage(top, bottom);

    if (!visible) {
      return visible;
    }

    return checkReadAndVisible(visible) || checkReadAndVisible(previousMessage(visible));
  }

  function idFromMessage(element) {
    const idStr = element.getAttribute('data-msg-id');

    if (idStr === null || idStr === undefined) {
      throw new Error('Bad message element');
    }

    return +idStr;
  }

  function visibleReadMessageIds() {
    const top = 0;
    const bottom = viewportHeight;
    let first = Number.MAX_SAFE_INTEGER;
    let last = 0;

    function walkElements(start, step) {
      let element = start;

      while (element && isVisible(element, top, bottom) && isRead(element, top, bottom)) {
        if (element.classList.contains('message')) {
          const id = idFromMessage(element);
          first = Math.min(first, id);
          last = Math.max(last, id);
        }

        element = element[step];
      }
    }

    const start = someVisibleReadMessage(top, bottom);
    walkElements(start, 'nextElementSibling');
    walkElements(start, 'previousElementSibling');
    return {
      first,
      last
    };
  }

  const getMessageIdFromElement = function (element) {
    let defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
    const msgElement = element.closest('.msglist-element');
    return msgElement ? +msgElement.getAttribute('data-msg-id') : defaultValue;
  };

  const setMessagesReadAttributes = rangeHull => {
    let element = document.querySelector("[data-msg-id='".concat(rangeHull.first, "']"));

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

  let prevMessageRange = visibleReadMessageIds();

  const sendScrollMessage = () => {
    const messageRange = visibleReadMessageIds();
    const rangeHull = {
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

  const sendScrollMessageIfListShort = () => {
    if (documentBody.scrollHeight === documentBody.clientHeight) {
      sendScrollMessage();
    }
  };

  let scrollEventsDisabled = true;
  let hasLongPressed = false;
  let longPressTimeout = undefined;
  let lastTouchPositionX = -1;
  let lastTouchPositionY = -1;

  const handleScrollEvent = () => {
    clearTimeout(longPressTimeout);

    if (scrollEventsDisabled) {
      return;
    }

    sendScrollMessage();
    const nearEnd = documentBody.offsetHeight - window.scrollY - window.innerHeight > 100;
    showHideElement('scroll-bottom', nearEnd);
  };

  window.addEventListener('scroll', handleScrollEvent);

  const scrollToBottom = () => {
    window.scroll({
      left: 0,
      top: documentBody.scrollHeight,
      behavior: 'smooth'
    });
  };

  const isNearBottom = () => documentBody.scrollHeight - 100 < documentBody.scrollTop + documentBody.clientHeight;

  const scrollToBottomIfNearEnd = () => {
    if (isNearBottom()) {
      scrollToBottom();
    }
  };

  const scrollToMessage = messageId => {
    const targetNode = messageId !== null ? document.getElementById("msg-".concat(messageId)) : null;

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

  const findPreserveTarget = () => {
    const message = someVisibleMessage(0, viewportHeight);

    if (!message) {
      return {
        type: 'none'
      };
    }

    const messageId = idFromMessage(message);
    const prevBoundRect = message.getBoundingClientRect();
    return {
      type: 'preserve',
      msgId: messageId,
      prevBoundTop: prevBoundRect.top
    };
  };

  const scrollToPreserve = (msgId, prevBoundTop) => {
    const newElement = document.getElementById("msg-".concat(msgId));

    if (!newElement) {
      return;
    }

    const newBoundRect = newElement.getBoundingClientRect();
    window.scrollBy(0, newBoundRect.top - prevBoundTop);
  };

  const runAfterLayout = fn => {
    if (platformOS === 'android') {
      fn();
      return;
    }

    requestAnimationFrame(() => {
      fn();
    });
  };

  const handleInboundEventContent = uevent => {
    const {
      scrollStrategy
    } = uevent;
    let target;

    switch (scrollStrategy) {
      case 'none':
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

    msglistElementsDiv.innerHTML = uevent.content;
    rewriteHtml(uevent.auth);
    runAfterLayout(() => {
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

  const handleInitialLoad = (scrollMessageId, rawAuth) => {
    const auth = _objectSpread2(_objectSpread2({}, rawAuth), {}, {
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

  const handleInboundEventFetching = uevent => {
    showHideElement('message-loading', uevent.showMessagePlaceholders);
    showHideElement('spinner-older', uevent.fetchingOlder);
    showHideElement('spinner-newer', uevent.fetchingNewer);
  };

  const handleInboundEventTyping = uevent => {
    const elementTyping = document.getElementById('typing');

    if (elementTyping) {
      elementTyping.innerHTML = uevent.content;
      runAfterLayout(() => scrollToBottomIfNearEnd());
    }
  };

  let readyRetryInterval = undefined;

  const signalReadyForEvents = () => {
    sendMessage({
      type: 'ready'
    });
    readyRetryInterval = setInterval(() => {
      sendMessage({
        type: 'ready'
      });
    }, 100);
  };

  const handleInboundEventReady = uevent => {
    clearInterval(readyRetryInterval);
  };

  const handleInboundEventMessagesRead = uevent => {
    if (uevent.messageIds.length === 0) {
      return;
    }

    const selector = uevent.messageIds.map(id => "[data-msg-id=\\"".concat(id, "\\"]")).join(',');
    const messageElements = document.querySelectorAll(selector);
    messageElements.forEach(element => {
      element.setAttribute('data-read', 'true');
    });
  };

  const inboundEventHandlers = {
    content: handleInboundEventContent,
    fetching: handleInboundEventFetching,
    typing: handleInboundEventTyping,
    ready: handleInboundEventReady,
    read: handleInboundEventMessagesRead
  };

  const handleMessageEvent = e => {
    scrollEventsDisabled = true;
    const decodedData = decodeURIComponent(escape(window.atob(e.data)));
    const rawInboundEvents = JSON.parse(decodedData);
    const inboundEvents = rawInboundEvents.map(inboundEvent => _objectSpread2(_objectSpread2({}, inboundEvent), inboundEvent.auth ? {
      auth: _objectSpread2(_objectSpread2({}, inboundEvent.auth), {}, {
        realm: new URL(inboundEvent.auth.realm)
      })
    } : {}));
    inboundEvents.forEach(uevent => {
      eventLogger.maybeCaptureInboundEvent(uevent);
      inboundEventHandlers[uevent.type](uevent);
    });
    scrollEventsDisabled = false;
  };

  const revealMutedMessages = message => {
    let messageNode = message;

    do {
      messageNode.setAttribute('data-mute-state', 'shown');
      messageNode = nextMessage(messageNode);
    } while (messageNode && messageNode.classList.contains('message-brief'));
  };

  const requireAttribute = (e, name) => {
    const value = e.getAttribute(name);

    if (value === null || value === undefined) {
      throw new Error("Missing expected attribute ".concat(name));
    }

    return value;
  };

  const requireNumericAttribute = (e, name) => {
    const value = requireAttribute(e, name);
    const parsedValue = parseInt(value, 10);

    if (Number.isNaN(parsedValue)) {
      throw new Error("Could not parse attribute ".concat(name, " value '").concat(value, "' as integer"));
    }

    return parsedValue;
  };

  documentBody.addEventListener('click', e => {
    e.preventDefault();
    clearTimeout(longPressTimeout);

    if (hasLongPressed) {
      hasLongPressed = false;
      return;
    }

    const {
      target
    } = e;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.matches('.scroll-bottom')) {
      scrollToBottom();
      return;
    }

    if (target.matches('.avatar-img') || target.matches('.name-and-status-emoji')) {
      sendMessage({
        type: 'request-user-profile',
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

    const inlineImageLink = target.closest('.message_inline_image a');

    if (inlineImageLink && !inlineImageLink.closest('.youtube-video, .vimeo-video')) {
      sendMessage({
        type: 'image',
        src: requireAttribute(inlineImageLink, 'href'),
        messageId: getMessageIdFromElement(inlineImageLink)
      });
      return;
    }

    if (target.matches('.reaction')) {
      sendMessage({
        type: 'reaction',
        name: requireAttribute(target, 'data-name'),
        code: requireAttribute(target, 'data-code'),
        reactionType: requireAttribute(target, 'data-type'),
        messageId: getMessageIdFromElement(target),
        voted: target.classList.contains('self-voted')
      });
      return;
    }

    if (target.matches('.poll-vote')) {
      const messageElement = target.closest('.message');

      if (!messageElement) {
        throw new Error('Message element not found');
      }

      const current_vote = requireAttribute(target, 'data-voted') === 'true';
      const vote = current_vote ? -1 : 1;
      sendMessage({
        type: 'vote',
        messageId: requireNumericAttribute(messageElement, 'data-msg-id'),
        key: requireAttribute(target, 'data-key'),
        vote
      });
      target.setAttribute('data-voted', (!current_vote).toString());
      target.innerText = (parseInt(target.innerText, 10) + vote).toString();
      return;
    }

    if (target.matches('time')) {
      const originalText = requireAttribute(target, 'original-text');
      sendMessage({
        type: 'time',
        originalText
      });
    }

    const closestA = target.closest('a');

    if (closestA) {
      sendMessage({
        type: 'url',
        href: requireAttribute(closestA, 'href'),
        messageId: getMessageIdFromElement(closestA)
      });
      return;
    }

    const spoilerHeader = target.closest('.spoiler-header');

    if (spoilerHeader instanceof HTMLElement) {
      toggleSpoiler(spoilerHeader);
      return;
    }

    const messageElement = target.closest('.message-brief');

    if (messageElement) {
      messageElement.getElementsByClassName('msg-timestamp')[0].classList.toggle('show');
      return;
    }
  });

  const handleLongPress = target => {
    hasLongPressed = true;
    const reactionNode = target.closest('.reaction');

    if (reactionNode) {
      sendMessage({
        type: 'reactionDetails',
        messageId: getMessageIdFromElement(target),
        reactionName: requireAttribute(reactionNode, 'data-name')
      });
      return;
    }

    const targetType = target.matches('.header') ? 'header' : target.matches('a') ? 'link' : 'message';
    const messageNode = target.closest('.message');

    if (targetType === 'message' && messageNode && messageNode.getAttribute('data-mute-state') === 'hidden') {
      revealMutedMessages(messageNode);
      return;
    }

    sendMessage({
      type: 'longPress',
      target: targetType,
      messageId: getMessageIdFromElement(target),
      href: target.matches('a') ? requireAttribute(target, 'href') : null
    });
  };

  documentBody.addEventListener('touchstart', e => {
    const {
      target
    } = e;

    if (e.changedTouches[0].pageX < 20 || !(target instanceof Element)) {
      return;
    }

    lastTouchPositionX = e.changedTouches[0].pageX;
    lastTouchPositionY = e.changedTouches[0].pageY;
    hasLongPressed = false;
    clearTimeout(longPressTimeout);
    longPressTimeout = setTimeout(() => handleLongPress(target), 500);
  });

  const isNearPositions = function () {
    let x1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    let y1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    let x2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    let y2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    return Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;
  };

  documentBody.addEventListener('touchend', e => {
    if (isNearPositions(lastTouchPositionX, lastTouchPositionY, e.changedTouches[0].pageX, e.changedTouches[0].pageY)) {
      clearTimeout(longPressTimeout);
    }
  });
  documentBody.addEventListener('touchcancel', e => {
    clearTimeout(longPressTimeout);
  });
  documentBody.addEventListener('touchmove', e => {
    clearTimeout(longPressTimeout);
  });
  documentBody.addEventListener('drag', e => {
    clearTimeout(longPressTimeout);
  });
  signalReadyForEvents();

  exports.handleInitialLoad = handleInitialLoad;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});

`;
