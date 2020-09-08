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

import InboundEventLogger from './InboundEventLogger';
import sendMessage from './sendMessage';
import rewriteHtml from './rewriteHtml';

/*
 * Supported platforms:
 *
 * * We support iOS 10.  So this code needs to work on Mobile Safari 10.
 *   Graceful degradation is acceptable below iOS 12 / Mobile Safari 12.
 *
 * * For Android, core functionality needs to work on Chrome 44.
 *   Graceful degradation is acceptable below Chrome 58.
 *
 *   * These versions are found in stock images for Android 6 Marshmallow
 *     and Android 8 Oreo, respectively, for convenient testing.
 *
 *   * (Note that Android's Chrome auto-updates independently of the OS, and
 *     the large majority of Android users have a fully-updated Chrome --
 *     more recent than the Safari on most iOS devices.)
 *
 *   * Below Chrome 44, it's possible (but rare) for a user to be on a
 *     version as old as Chrome 37, which shipped with Android 5 Lollipop.
 *     We sometimes fix issues affecting those versions, only when trivial.
 *
 * * See docs/architecture/platform-versions.md for data and discussion
 *   about our version-support strategy.
 */

/* eslint-disable no-extend-native */

/* Polyfill Array.from. Native in Chrome 45 and at least Safari 13.
   Leaves out some of the fancy features (see MDN). */
type ArrayLike<T> = { [indexer: number]: T, length: number, ... };
if (!Array.from) {
  // $FlowFixMe (polyfill)
  Array.from = function from<T>(arr: ArrayLike<T>): Array<T> {
    return Array.prototype.slice.call(arr);
  };
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

/* Polyfill String#startsWith. Native in Mobile Safari 9, Chrome 49.
   Taken (with minor edits) from the relevant MDN page. */
if (!String.prototype.startsWith) {
  // $FlowFixMe (polyfill)
  String.prototype.startsWith = function startsWith(search: string, rawPos: number) {
    const pos = rawPos > 0 ? rawPos | 0 : 0;
    return this.substring(pos, pos + search.length) === search;
  };
}

/* Polyfill String#includes. Native in Mobile Safari 9, Chrome 41.
   Based directly on the current ECMAScript draft:
     https://tc39.es/ecma262/#sec-string.prototype.includes */
if (!String.prototype.includes) {
  // $FlowFixMe (polyfill)
  String.prototype.includes = function includes(search: string, start: number = 0) {
    /* required by the spec, but not worth the trouble */
    // if (search instanceof RegExp) { throw new TypeError('...'); }
    return this.indexOf(search, start) !== -1;
  };
}

/* eslint-enable no-extend-native */

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

window.onerror = (message: string, source: string, line: number, column: number, error: Error) => {
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

const eventLogger = new InboundEventLogger();
eventLogger.startCapturing();
// After 10 seconds, if the loading placeholders are *still* visible,
// we want to know all the inbound events that were received in that
// time (with sensitive info redacted, of course).
setTimeout(() => {
  const placeholdersDiv = document.getElementById('message-loading');
  eventLogger.stopCapturing();
  if (placeholdersDiv && !placeholdersDiv.classList.contains('hidden')) {
    eventLogger.send();
  }
  eventLogger.reset();
}, 10000);

const showHideElement = (elementId: string, show: boolean) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle('hidden', !show);
  }
};

/* Cached to avoid re-looking it up all the time. */
let viewportHeight = documentBody.clientHeight;

window.addEventListener('resize', event => {
  const heightChange = documentBody.clientHeight - viewportHeight;
  viewportHeight = documentBody.clientHeight;

  // Now we try to scroll to keep the bottom edge of the viewport aligned to
  // the same content it was before the resize.  We assume the browser tried
  // to keep the top edge aligned instead.
  //
  // Mostly, that means if the viewport grew, then the bottom edge moved down,
  // so we'll scroll back up by the same amount; vice versa if it shrank.

  // But if we were near the bottom pre-resize, and grew, then there may not
  // have been room for the bottom edge to move that far down, and we
  // shouldn't try to compensate -- if we do, we could end up scrolling up
  // higher than we started.
  //
  // If that happened, we'll be at the very bottom now.
  const maxScrollTop = documentBody.scrollHeight - documentBody.clientHeight;
  if (documentBody.scrollTop >= maxScrollTop - 1) {
    // We're at (or within a px of, or beyond) the very bottom of the
    // content.  Don't scroll.
    //
    // This does mean if you're near the bottom, and then the viewport grows
    // by more than that distance, you'll wind up at the very bottom instead
    // of where you were.  That's not our ideal behavior.  OTOH it's
    // mitigated by the fact that in this situation everything that was in
    // view is still in view.
    return;
  }

  // Scrolling by a positive `top` scrolls down; negative scrolls up.
  window.scrollBy({ left: 0, top: -heightChange });
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
  if (document.elementsFromPoint === undefined) {
    const element = document.elementFromPoint(0, midY);
    return element && element.closest('body > *');
  }

  const midElements: Array<HTMLElement> = document.elementsFromPoint(0, midY);
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
  | { type: 'anchor', messageId: number | null }
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

const scrollToMessage = (messageId: number | null) => {
  const targetNode = messageId !== null ? document.getElementById(`msg-${messageId}`) : null;
  if (targetNode) {
    targetNode.scrollIntoView({ block: 'start' });
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

const handleUpdateEventContent = (uevent: WebViewUpdateEventContent) => {
  let target: ScrollTarget;
  if (uevent.updateStrategy === 'replace') {
    target = { type: 'none' };
  } else if (uevent.updateStrategy === 'scroll-to-anchor') {
    target = { type: 'anchor', messageId: uevent.scrollMessageId };
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

  rewriteHtml(uevent.auth);

  if (target.type === 'bottom') {
    scrollToBottom();
  } else if (target.type === 'anchor') {
    scrollToMessage(target.messageId);
  } else if (target.type === 'preserve') {
    scrollToPreserve(target.msgId, target.prevBoundTop);
  }

  sendScrollMessageIfListShort();
};

// We call this when the webview's content first loads.
export const handleInitialLoad = (
  platformOS: string,
  scrollMessageId: number | null,
  auth: Auth,
) => {
  // Since its version 5.x, the `react-native-webview` library dispatches our
  // `message` events at `window` on iOS but `document` on Android.
  if (platformOS === 'ios') {
    /* eslint-disable-next-line no-use-before-define */
    window.addEventListener('message', handleMessageEvent);
  } else {
    /* eslint-disable-next-line no-use-before-define */
    document.addEventListener('message', handleMessageEvent);
  }

  scrollToMessage(scrollMessageId);
  rewriteHtml(auth);
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
  const messageElements = Array.from(document.querySelectorAll(selector));
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

// See `handleInitialLoad` for how this gets subscribed to events.
const handleMessageEvent: MessageEventListener = e => {
  scrollEventsDisabled = true;
  const decodedData = decodeURIComponent(escape(window.atob(e.data)));
  const updateEvents: WebViewUpdateEvent[] = JSON.parse(decodedData);
  updateEvents.forEach((uevent: WebViewUpdateEvent) => {
    eventLogger.maybeCaptureInboundEvent(uevent);
    // $FlowFixMe
    eventUpdateHandlers[uevent.type](uevent);
  });
  scrollEventsDisabled = false;
};

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

/**
 * Returns the integer parsed value of a DOM element attribute.
 *
 * Throws if parsing fails.
 */
const requireNumericAttribute = (e: Element, name: string): number => {
  const value = requireAttribute(e, name);
  const parsedValue = parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    throw new Error(`Could not parse attribute ${name} value '${value}' as integer`);
  }
  return parsedValue;
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
      fromUserId: requireNumericAttribute(target, 'data-sender-id'),
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

  if (target.matches('.user-mention')) {
    sendMessage({
      type: 'mention',
      userId: requireNumericAttribute(target, 'data-user-id'),
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

  if (target.matches('time')) {
    const originalText = requireAttribute(target, 'original-text');
    sendMessage({
      type: 'time',
      originalText,
    });
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

  const reactionNode = target.closest('.reaction');
  if (reactionNode) {
    sendMessage({
      type: 'reactionDetails',
      messageId: getMessageIdFromNode(target),
      reactionName: requireAttribute(reactionNode, 'data-name'),
    });
    return;
  }

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
