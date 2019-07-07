/* @flow strict-local */
/* eslint-disable no-useless-return */
import type { Auth } from '../../types';
import type {
  WebViewUpdateEvent,
  WebViewUpdateEventContent,
  WebViewUpdateEventFetching,
  WebViewUpdateEventTyping,
  WebViewUpdateEventReady,
  WebViewUpdateEventMessagesRead,
} from '../webViewHandleUpdates';
import type { MessageListEvent } from '../webViewEventHandlers';

/*
 * Supported platforms:
 *
 * * We support iOS 9.  So this code needs to work on Mobile Safari 9.
 *   Graceful degradation is acceptable below iOS 10 / Mobile Safari 10.
 *
 * * On Android, core functionality needs to work on Chrome 44 (conveniently
 *   available for testing in a stock Android 6.0 Marshmallow image.)
 *   Graceful degradation is acceptable below Chrome 58 (ditto 8.0 Oreo.)
 *   When aware of issues down to Chrome 30 (shipped with 4.4 KitKat), we
 *   fix them if trivial, or else record in comments here.
 *
 *   * More details: Starting in Android 4.4 KitKat, which is our minimum
 *     supported Android version, the browser in a WebView is updated as an
 *     APK, independently of the OS... but empirically something like 10% of
 *     users are stuck on older versions than the latest, though usually
 *     still newer than their OS was released with.  These targets are based
 *     on figures from 2018-10.
 *
 *   * To be explicit: although we support Android as old as 4.4 and 5.0,
 *     the app *doesn't work correctly* on the Chrome versions (30 and 37)
 *     that those Android releases originally shipped with.  That's OK
 *     because it is rare for a user's Chrome version to still be that
 *     ancient, even when their Android version is.
 */

/**
 * Convert an array-like object to an actual array.
 *
 * A substitute for `Array.from`, which doesn't exist in the WebViews of some
 * of our supported platforms.
 */
function arrayFrom<T>(arrayLike: HTMLCollection<T>): T[] {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Array-like_objects
  return Array.prototype.slice.call(arrayLike);
}

/**
 * A substitute for `Array.from`, for `NodeList` input.
 *
 * See `arrayFrom`.  Duplicated to satisfy Flow.
 */
// On at least Flow v0.78.0, writing `HTMLCollection<T> | NodeList<T>`
// worked fine for `HTMLCollection` arguments, but not `NodeList`.  Shrug.
function arrayFromNodes<T>(arrayLike: NodeList<T>): T[] {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Array-like_objects
  return Array.prototype.slice.call(arrayLike);
}

/*
 * Polyfill Element#closest.
 *
 * This method appears natively in Mobile Safari 9 and Chrome 41.
 *
 * Uses Element#matches, which we have a separate polyfill for.
 */
if (!Element.prototype.closest) {
  // $FlowFixMe closest is not writable... except it's absent here.
  Element.prototype.closest = function closest(selector) {
    let element = this;
    while (element && !element.matches(selector)) {
      element = element.parentElement;
    }
    return element;
  };
}

// We pull out document.body in one place, and check it's not null, in order
// to provide that assertion to the type-checker.
const documentBody = document.body;
if (!documentBody) {
  throw new Error('No document.body element!');
}

const escapeHtml = (text: string): string => {
  const element = document.createElement('div');
  element.innerText = text;
  return element.innerHTML;
};

const sendMessage = (msg: MessageListEvent) => {
  window.postMessage(JSON.stringify(msg), '*');
};

window.onerror = (message, source, line, column, error) => {
  if (window.enableWebViewErrorDisplay) {
    const elementJsError = document.getElementById('js-error-detailed');
    if (elementJsError) {
      elementJsError.innerHTML = [
        `Message: ${message}`,
        `Source: ${source}`,
        `Line: ${line}:${column}`,
        `Error: ${JSON.stringify(error)}`,
        '',
      ]
        .map(escapeHtml)
        .join('<br>');
    }
  } else {
    const elementJsError = document.getElementById('js-error-plain');
    const elementSheetGenerated = document.getElementById('generated-styles');
    const elementSheetHide = document.getElementById('style-hide-js-error-plain');
    if (
      elementJsError
      && elementSheetGenerated
      && elementSheetHide
      && elementSheetHide instanceof HTMLStyleElement
      && elementSheetHide.sheet
      && elementSheetGenerated instanceof HTMLStyleElement
      && elementSheetGenerated.sheet
    ) {
      elementSheetHide.sheet.disabled = true;
      const height = elementJsError.offsetHeight;
      // $FlowFixMe `sheet: StyleSheet` type is not comprehensive enough
      elementSheetGenerated.sheet.insertRule(`.header-wrapper { top: ${height}px; }`, 0);
    }
  }

  sendMessage({
    type: 'error',
    details: {
      message,
      source,
      line,
      column,
      error,
    },
  });

  return true;
};

const showHideElement = (elementId: string, show: boolean) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle('hidden', !show);
  }
};

/* Cached to avoid re-looking it up all the time. */
let viewportHeight = documentBody.clientHeight;

window.addEventListener('resize', event => {
  const difference = viewportHeight - documentBody.clientHeight;
  if (documentBody.scrollHeight !== documentBody.scrollTop + documentBody.clientHeight) {
    window.scrollBy({ left: 0, top: difference });
  }
  viewportHeight = documentBody.clientHeight;
});

/*
 *
 * Identifying visible messages
 *
 */

/**
 * Returns a "message-peer" element visible mid-screen, if any.
 *
 * A "message-peer" element is a message or one of their siblings that get
 * laid out among them: e.g. a recipient bar or date separator, but not an
 * absolutely-positioned overlay.
 *
 * If the middle of the screen is just blank, returns null.
 */
function midMessagePeer(top: number, bottom: number): ?Element {
  // The assumption we depend on: any random widgets we draw that aren't
  // part of a message-peer are drawn *over* the message-peers, not under.
  //
  // By spec, the elements returned by Document#elementsFromPoint are in
  // paint order, topmost (and inmost) first.  By our assumption, that means
  // the sequence is:
  //   [ ...(random widgets, if any),
  //     ...(descendants of message-peer), message-peer,
  //     body, html ]
  //
  // On ancient browsers (missing Document#elementsFromPoint), we make a
  // stronger assumption: at the vertical middle of the screen, we don't
  // draw *any* widgets over a message-peer.  (I.e., we only do so near the
  // top and bottom: like floating recipient bars, the error banner, and the
  // scroll-bottom button.)

  const midY = (bottom + top) / 2;

  // Document#elementsFromPoint appears in iOS 10 and Chrome 43.
  // $FlowFixMe: doesn't know about Document#elementsFromPoint
  if (document.elementsFromPoint === undefined) {
    const element = document.elementFromPoint(0, midY);
    return element && element.closest('body > *');
  }

  // $FlowFixMe: doesn't know about Document#elementsFromPoint
  const midElements: Array<Element> = document.elementsFromPoint(0, midY);
  if (midElements.length < 3) {
    // Just [body, html].
    return null;
  }
  return midElements[midElements.length - 3];
}

function walkToMessage(
  start: ?Element,
  step: 'nextElementSibling' | 'previousElementSibling',
): ?Element {
  let element: ?Element = start;
  while (element && !element.classList.contains('message')) {
    // $FlowFixMe: doesn't use finite type of `step`
    element = element[step];
  }
  return element;
}

function firstMessage(): ?Element {
  return walkToMessage(documentBody.firstElementChild, 'nextElementSibling');
}

function lastMessage(): ?Element {
  return walkToMessage(documentBody.lastElementChild, 'previousElementSibling');
}

/** The minimum height (in px) to see of a message to call it visible. */
const minOverlap = 20;

function isVisible(element: Element, top: number, bottom: number): boolean {
  const rect = element.getBoundingClientRect();
  return top + minOverlap < rect.bottom && rect.top + minOverlap < bottom;
}

/** Returns some message element which is visible, if any. */
function someVisibleMessage(top: number, bottom: number): ?Element {
  function checkVisible(candidate: ?Element): ?Element {
    return candidate && isVisible(candidate, top, bottom) ? candidate : null;
  }
  // Algorithm: if some message-peer is visible, then either the message
  // just before or after it should be visible.  If not, we must be at one
  // end of the message list, meaning either the first or last message
  // (or both) should be visible.
  const midPeer = midMessagePeer(top, bottom);
  return (
    checkVisible(walkToMessage(midPeer, 'previousElementSibling'))
    || checkVisible(walkToMessage(midPeer, 'nextElementSibling'))
    || checkVisible(firstMessage())
    || checkVisible(lastMessage())
  );
}

function idFromMessage(element: Element): number {
  const idStr = element.getAttribute('data-msg-id');
  if (idStr === null || idStr === undefined) {
    throw new Error('Bad message element');
  }
  return +idStr;
}

/**
 * Returns the IDs of the first and last visible messages, if any.
 *
 * If no messages are visible, the return value has first > last.
 */
function visibleMessageIds(): { first: number, last: number } {
  // Algorithm: We find some message that's visible; then walk both up and
  // down from there to find all the visible messages.

  const top = 0;
  const bottom = viewportHeight;
  let first = Number.MAX_SAFE_INTEGER;
  let last = 0;

  // Walk through visible elements, observing message IDs.
  function walkElements(start: ?Element, step: 'nextElementSibling' | 'previousElementSibling') {
    let element = start;
    while (element && isVisible(element, top, bottom)) {
      if (element.classList.contains('message')) {
        const id = idFromMessage(element);
        first = Math.min(first, id);
        last = Math.max(last, id);
      }
      // $FlowFixMe: doesn't use finite type of `step`
      element = element[step];
    }
  }

  const start = someVisibleMessage(top, bottom);
  walkElements(start, 'nextElementSibling');
  walkElements(start, 'previousElementSibling');

  return { first, last };
}

/** DEPRECATED */
const getMessageNode = (node: ?Node): ?Node => {
  let curNode = node;
  while (curNode && curNode.parentNode && curNode.parentNode !== documentBody) {
    curNode = curNode.parentNode;
  }
  return curNode;
};

/** DEPRECATED */
const getMessageIdFromNode = (node: ?Node, defaultValue: number = -1): number => {
  const msgNode = getMessageNode(node);
  return msgNode && msgNode instanceof Element
    ? +msgNode.getAttribute('data-msg-id')
    : defaultValue;
};

/**
 * Set the 'data-read' attribute to a given range of message elements.
 * This is styled with css to indicate visually what messages are being read.
 */
const setMessagesReadAttributes = rangeHull => {
  let element = document.querySelector(`[data-msg-id='${rangeHull.first}']`);
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

/*
 *
 * Reporting scrolls to outside, to mark messages as read
 *
 */

/** The range of message IDs visible whenever we last checked. */
let prevMessageRange = visibleMessageIds();

const sendScrollMessage = () => {
  const messageRange = visibleMessageIds();
  // rangeHull is the convex hull of the previous range and the new one.
  // When the user is actively scrolling, the browser gives us scroll events
  // only occasionally, so we use this to interpolate scrolling past the
  // messages in between, as a partial workaround.
  const rangeHull = {
    first: Math.min(prevMessageRange.first, messageRange.first),
    last: Math.max(prevMessageRange.last, messageRange.last),
  };
  sendMessage({
    type: 'scroll',
    // See MessageListEventScroll for the meanings of these properties.
    offsetHeight: documentBody.offsetHeight,
    innerHeight: window.innerHeight,
    scrollY: window.scrollY,
    startMessageId: rangeHull.first,
    endMessageId: rangeHull.last,
  });
  setMessagesReadAttributes(rangeHull);
  prevMessageRange = messageRange;
};

// If the message list is too short to scroll, fake a scroll event
// in order to cause the messages to be marked as read.
const sendScrollMessageIfListShort = () => {
  if (documentBody.scrollHeight === documentBody.clientHeight) {
    sendScrollMessage();
  }
};

/**
 * Disable reporting scrolls to the outside to mark messages as read.
 *
 * This is set while we're first setting up after the content loads, and
 * while we're handling `message` events from the outside and potentially
 * rewriting the content.
 */
let scrollEventsDisabled = true;

let hasLongPressed = false;
let longPressTimeout;
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

/*
 *
 * Updating message content, and re-scrolling
 *
 */

type ScrollTarget =
  | { type: 'none' }
  | { type: 'bottom' }
  | { type: 'anchor', anchor: number }
  | { type: 'preserve', msgId: number, prevBoundTop: number };

const scrollToBottom = () => {
  window.scroll({ left: 0, top: documentBody.scrollHeight, behavior: 'smooth' });
};

const isNearBottom = (): boolean =>
  documentBody.scrollHeight - 100 < documentBody.scrollTop + documentBody.clientHeight;

const scrollToBottomIfNearEnd = () => {
  if (isNearBottom()) {
    scrollToBottom();
  }
};

const scrollToAnchor = (anchor: number) => {
  const anchorNode = document.getElementById(`msg-${anchor}`);

  if (anchorNode) {
    anchorNode.scrollIntoView({ block: 'start' });
  } else {
    window.scroll({ left: 0, top: documentBody.scrollHeight + 200 });
  }
};

// Try to identify a message on screen and its location, so we can
// scroll the corresponding message to the same place afterward.
const findPreserveTarget = (): ScrollTarget => {
  const message = someVisibleMessage(0, viewportHeight);
  if (!message) {
    // TODO log this -- it's an error which the user will notice.
    // (We don't attempt this unless there are messages already,
    // which we really want to keep steady in view.)
    return { type: 'none' };
  }
  const messageId = idFromMessage(message);
  const prevBoundRect = message.getBoundingClientRect();
  return { type: 'preserve', msgId: messageId, prevBoundTop: prevBoundRect.top };
};

// Scroll the given message to the same height it was at before.
const scrollToPreserve = (msgId: number, prevBoundTop: number) => {
  const newElement = document.getElementById(`msg-${msgId}`);
  if (!newElement) {
    // TODO log this -- it's an error which the user will notice.
    return;
  }
  const newBoundRect = newElement.getBoundingClientRect();
  window.scrollBy(0, newBoundRect.top - prevBoundTop);
};

const appendAuthToImages = auth => {
  const imageTags = document.getElementsByTagName('img');
  arrayFrom(imageTags).forEach(img => {
    if (!img.src.startsWith(auth.realm)) {
      return;
    }

    // This unusual form of authentication is only accepted by the server
    // for a small number of routes.  Rather than append the API key to all
    // kinds of URLs on the server, do so only for those routes.
    const srcPath = img.src.substring(auth.realm.length);
    if (
      !(
        srcPath.startsWith('/user_uploads/')
        || srcPath.startsWith('/thumbnail?')
        || srcPath.startsWith('/avatar/')
      )
    ) {
      return;
    }

    const delimiter = img.src.includes('?') ? '&' : '?';
    img.src += `${delimiter}api_key=${auth.apiKey}`;
  });
};

const handleUpdateEventContent = (uevent: WebViewUpdateEventContent) => {
  let target: ScrollTarget;
  if (uevent.updateStrategy === 'replace') {
    target = { type: 'none' };
  } else if (uevent.updateStrategy === 'scroll-to-anchor') {
    target = { type: 'anchor', anchor: uevent.anchor };
  } else if (
    uevent.updateStrategy === 'scroll-to-bottom-if-near-bottom'
    && isNearBottom() /* align */
  ) {
    target = { type: 'bottom' };
  } else {
    // including 'default' and 'preserve-position'
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

/** We call this when the webview's content first loads. */
const handleInitialLoad = /* eslint-disable-line */ (anchor: number, auth: Auth) => {
  scrollToAnchor(anchor);
  appendAuthToImages(auth);
  sendScrollMessageIfListShort();
  scrollEventsDisabled = false;
};

/*
 *
 * Handling other message-from-outside events
 *
 */

const handleUpdateEventFetching = (uevent: WebViewUpdateEventFetching) => {
  showHideElement('message-loading', uevent.showMessagePlaceholders);
  showHideElement('spinner-older', uevent.fetchingOlder);
  showHideElement('spinner-newer', uevent.fetchingNewer);
};

const handleUpdateEventTyping = (uevent: WebViewUpdateEventTyping) => {
  const elementTyping = document.getElementById('typing');
  if (elementTyping) {
    elementTyping.innerHTML = uevent.content;
    setTimeout(() => scrollToBottomIfNearEnd());
  }
};

/**
 * Echo back the handshake message, confirming the channel is ready.
 */
const handleUpdateEventReady = (uevent: WebViewUpdateEventReady) => {
  sendMessage({ type: 'ready' });
};

/**
 * Handles messages that have been read outside of the WebView
 */
const handleUpdateEventMessagesRead = (uevent: WebViewUpdateEventMessagesRead) => {
  if (uevent.messageIds.length === 0) {
    return;
  }
  const selector = uevent.messageIds.map(id => `[data-msg-id="${id}"]`).join(',');
  const messageElements = arrayFromNodes(document.querySelectorAll(selector));
  messageElements.forEach(element => {
    element.setAttribute('data-read', 'true');
  });
};

const eventUpdateHandlers = {
  content: handleUpdateEventContent,
  fetching: handleUpdateEventFetching,
  typing: handleUpdateEventTyping,
  ready: handleUpdateEventReady,
  read: handleUpdateEventMessagesRead,
};

document.addEventListener('message', e => {
  scrollEventsDisabled = true;
  // $FlowFixMe
  const decodedData = decodeURIComponent(escape(window.atob(e.data)));
  const updateEvents: WebViewUpdateEvent[] = JSON.parse(decodedData);
  updateEvents.forEach((uevent: WebViewUpdateEvent) => {
    // $FlowFixMe
    eventUpdateHandlers[uevent.type](uevent);
  });
  scrollEventsDisabled = false;
});

/*
 *
 * Handling user touches
 *
 */

const requireAttribute = (e: Element, name: string): string => {
  const value = e.getAttribute(name);
  if (value === null || value === undefined) {
    throw new Error(`Missing expected attribute ${name}`);
  }
  return value;
};

documentBody.addEventListener('click', (e: MouseEvent) => {
  e.preventDefault();
  clearTimeout(longPressTimeout);

  /* Without a flag `hasLongPressed`, both the short press and the long
   * press actions get triggered. See PR #3404 for more context. */
  if (hasLongPressed) {
    hasLongPressed = false;
    return;
  }

  const { target } = e;

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
      fromEmail: requireAttribute(target, 'data-email'),
    });
    return;
  }

  if (target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: requireAttribute(target, 'data-narrow'),
    });
    return;
  }

  /* Should we pull up the lightbox?  For comparison, see the web app's
   * static/js/lightbox.js , starting at the `#main_div` click handler. */
  const inlineImageLink = target.closest('.message_inline_image a');
  if (
    inlineImageLink
    /* The web app displays certain videos inline, but on mobile
     * we'd rather let another app handle them, as links. */
    && !inlineImageLink.closest('.youtube-video, .vimeo-video')
  ) {
    sendMessage({
      type: 'image',
      src: requireAttribute(inlineImageLink, 'href'), // TODO: should be `src` / `data-src-fullsize`.
      messageId: getMessageIdFromNode(inlineImageLink),
    });
    return;
  }

  if (target.matches('a')) {
    sendMessage({
      type: 'url',
      href: requireAttribute(target, 'href'),
      messageId: getMessageIdFromNode(target),
    });
    return;
  }

  if (target.parentNode instanceof Element && target.parentNode.matches('a')) {
    sendMessage({
      type: 'url',
      href: requireAttribute(target.parentNode, 'href'),
      messageId: getMessageIdFromNode(target.parentNode),
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
      voted: target.classList.contains('self-voted'),
    });
    return;
  }

  const messageElement = target.closest('.message-brief');
  if (messageElement) {
    messageElement.getElementsByClassName('timestamp')[0].classList.toggle('show');
    return;
  }
});

const handleLongPress = (target: Element) => {
  // The logic is believed not to cover all the cases it should; for
  // example, multi-touch events. Better would be to either find a
  // library we can use which strives to handle all that complexity, or
  // get long-press events from the platform.

  hasLongPressed = true;

  sendMessage({
    type: 'longPress',
    target: target.matches('.header') ? 'header' : target.matches('a') ? 'link' : 'message',
    messageId: getMessageIdFromNode(target),
    href: target.matches('a') ? requireAttribute(target, 'href') : null,
  });
};

documentBody.addEventListener('touchstart', (e: TouchEvent) => {
  const { target } = e;
  if (e.changedTouches[0].pageX < 20 || !(target instanceof Element)) {
    return;
  }

  lastTouchPositionX = e.changedTouches[0].pageX;
  lastTouchPositionY = e.changedTouches[0].pageY;
  hasLongPressed = false;
  clearTimeout(longPressTimeout);
  longPressTimeout = setTimeout(() => handleLongPress(target), 500);
});

const isNearPositions = (x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 0): boolean =>
  Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;

documentBody.addEventListener('touchend', (e: TouchEvent) => {
  if (
    isNearPositions(
      lastTouchPositionX,
      lastTouchPositionY,
      e.changedTouches[0].pageX,
      e.changedTouches[0].pageY,
    )
  ) {
    clearTimeout(longPressTimeout);
  }
});

documentBody.addEventListener('touchcancel', (e: TouchEvent) => {
  clearTimeout(longPressTimeout);
});

documentBody.addEventListener('touchmove', (e: TouchEvent) => {
  clearTimeout(longPressTimeout);
});

documentBody.addEventListener('drag', (e: DragEvent) => {
  clearTimeout(longPressTimeout);
});
