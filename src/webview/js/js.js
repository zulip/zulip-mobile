/* @flow strict-local */
/* eslint-disable no-useless-return */
import type { Auth } from '../../types';
import type {
  WebViewInboundEvent,
  WebViewInboundEventContent,
  WebViewInboundEventFetching,
  WebViewInboundEventTyping,
  WebViewInboundEventReady,
  WebViewInboundEventMessagesRead,
} from '../generateInboundEvents';
import { makeUserId } from '../../api/idTypes';

import InboundEventLogger from './InboundEventLogger';
import sendMessage from './sendMessage';
import rewriteHtml from './rewriteHtml';
import { toggleSpoiler } from './spoilers';
import { ensureUnreachable } from '../../generics';

/*
 * Supported platforms:
 *
 * * (When updating these, be sure to update tools/generate-webview-js too.)
 *
 * * We support iOS 12.  So this code needs to work on Mobile Safari 12.
 *   Graceful degradation is acceptable below iOS 14 / Mobile Safari 14.
 *
 * * For Android, core functionality needs to work on Chrome 44.
 *   Graceful degradation is acceptable below Chrome 74.
 *
 *   * These versions are found in stock images for Android 6 Marshmallow
 *     and Android 10, respectively, for convenient testing.
 *
 *   * (Note that Android's Chrome auto-updates independently of the OS, and
 *     the large majority of Android users have a fully-updated Chrome --
 *     more recent than the Safari on most iOS devices.)
 *
 * * See docs/architecture/platform-versions.md for data and discussion
 *   about our version-support strategy.
 */

/**
 * A copy of RN's `Platform.OS`.
 *
 * Provided by the template in `script.js`.
 */
declare var platformOS: string;

/**
 * The value of `process.env.NODE_ENV === 'development'` in RN-land.
 *
 * Provided by the template in `script.js`.
 */
declare var isDevelopment: string;

/**
 * used to control behavior based on debug settings.
 * defined in `handleInitialLoad`.
 * declared globally so as to use across functions.
 */
declare var doNotMarkMessagesAsRead: boolean;

/* eslint-disable no-extend-native */

/* Polyfill Array.from. Native in Chrome 45 and at least Safari 13.
   Leaves out some of the fancy features (see MDN). */
if (!Array.from) {
  // $FlowFixMe[cannot-write] (polyfill)
  Array.from = function from<T>(arr: $ArrayLike<T>): Array<T> {
    return Array.prototype.slice.call(arr);
  };
}

/* Polyfill String#startsWith. Native in Mobile Safari 9, Chrome 49.
   Taken (with minor edits) from the relevant MDN page. */
if (!String.prototype.startsWith) {
  // $FlowFixMe[cannot-write] (polyfill)
  String.prototype.startsWith = function startsWith(search: string, rawPos: number) {
    const pos = rawPos > 0 ? rawPos | 0 : 0;
    return this.substring(pos, pos + search.length) === search;
  };
}

/* eslint-enable no-extend-native */

// We pull out document.body in one place, and check it's not null, in order
// to provide that assertion to the type-checker.
const documentBody = document.body;
if (!documentBody) {
  throw new Error('No document.body element!');
}

const msglistElementsDiv = document.querySelector('div#msglist-elements');
if (!msglistElementsDiv) {
  throw new Error('No div#msglist-elements element!');
}

const escapeHtml = (text: string): string => {
  const element = document.createElement('div');
  element.innerText = text;
  return element.innerHTML;
};

window.onerror = (message: string, source: string, line: number, column: number, error: Error) => {
  if (isDevelopment) {
    // In development, show a detailed error banner for debugging.
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
    // In a release build published for normal use, just show a short,
    // friendly, generic error message.  We'll report the error details
    // via Sentry, below.
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

  const userAgent = window.navigator.userAgent;
  sendMessage({
    type: 'error',
    details: {
      message,
      source,
      line,
      column,
      userAgent,
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
 * Returns a "message-list element" visible mid-screen, if any.
 *
 * A "message-list element" is a message or one of their siblings that get
 * laid out among them: e.g. a recipient bar or date separator, but not an
 * absolutely-positioned overlay. All message-list elements are direct
 * children of a div#msglist-elements.
 *
 * If the middle of the screen is just blank, returns null.
 */
function midMessageListElement(top: number, bottom: number): ?Element {
  // The assumption we depend on: any random widgets we draw that aren't
  // part of a message-list element are drawn *over* the message-list
  // elements, not under.
  //
  // By spec, the elements returned by Document#elementsFromPoint are in
  // paint order, topmost (and inmost) first.  By our assumption, that means
  // the sequence is:
  //   [ ...(random widgets, if any),
  //     ...(descendants of message-list element), message-list element,
  //     div#msglist-elements, body, html ]

  const midY = (bottom + top) / 2;

  const midElements: Array<HTMLElement> = document.elementsFromPoint(0, midY);
  if (midElements.length < 4) {
    // Just [div#msglist-elements, body, html].
    return null;
  }
  return midElements[midElements.length - 4];
}

/**
 * Find a message element at or near the given element.
 *
 * The given element should be a "message-list element"; see
 * `midMessageListElement` for discussion.
 *
 * If the given element is a message, returns that element.  Otherwise,
 * returns the message that comes just after or just before it, depending on
 * the value of `step`.
 */
function walkToMessage(
  start: ?Element,
  step: 'nextElementSibling' | 'previousElementSibling',
): ?Element {
  let element: ?Element = start;
  while (element && !element.classList.contains('message')) {
    // $FlowFixMe[prop-missing]: doesn't use finite type of `step`
    element = element[step];
  }
  return element;
}

/** The first message element in the document. */
function firstMessage(): ?Element {
  return walkToMessage(msglistElementsDiv.firstElementChild, 'nextElementSibling');
}

/** The last message element in the document. */
function lastMessage(): ?Element {
  return walkToMessage(msglistElementsDiv.lastElementChild, 'previousElementSibling');
}

/** The message before the given message, if any. */
function previousMessage(start: Element): ?Element {
  return walkToMessage(start.previousElementSibling, 'previousElementSibling');
}

/** The message after the given message, if any. */
function nextMessage(start: Element): ?Element {
  return walkToMessage(start.nextElementSibling, 'nextElementSibling');
}

/**
 * An element is visible if any part of it is visible on screen.
 *
 * @param top The top of the screen (typically 0)
 * @param bottom The bottom of the screen (typically body.clientHeight)
 */
function isVisible(element: Element, top: number, bottom: number): boolean {
  const rect = element.getBoundingClientRect();
  return top < rect.bottom && rect.top < bottom;
}

/**
 * The number of pixels of the message that are allowed to be scrolled off
 * the bottom of the screen when we mark the message as "read".
 */
// Picked based on the bottom padding of messages in CSS. This doesn't work
// so great in cases where messages have the "edited" badge or reaction emojis,
// since the user needs to scorll to the bottom of the reaction emoji/edited
// badge section for the message to be "read", but it's more important for the
// single-line message case to not get inadvertently read than it is for
// messages to get marked read exactly when the bottom of the text of the
// message comes onto the screen. In the future, we may want more complicated
// behaviour here, but this should be fine for now.
const messageReadSlop = 16;

/**
 * A visible message is read when its bottom isn't too far down out of view.
 *
 * See `messageReadSlop` for specifically how far the bottom might be. The
 * idea is that a message becomes read when the bottom of its content
 * scrolls into view, excluding the padding between messages.
 *
 * This function doesn't check that the message is visible; it probably
 * makes sense to call only when `isVisible` is already known to be true.
 *
 * @param top The top of the screen (typically 0)
 * @param bottom The bottom of the screen (typically body.clientHeight)
 */
function isRead(element: Element, top: number, bottom: number): boolean {
  return bottom + messageReadSlop >= element.getBoundingClientRect().bottom;
}

/** Returns some message element which is visible, if any. */
function someVisibleMessage(top: number, bottom: number): ?Element {
  function checkVisible(candidate: ?Element): ?Element {
    return candidate && isVisible(candidate, top, bottom) ? candidate : null;
  }
  // Algorithm: if some message-list element is visible, then either the
  // message just before or after it should be visible.  If not, we must be
  // at one end of the message list, meaning either the first or last
  // message (or both) should be visible.
  const midElement = midMessageListElement(top, bottom);
  return (
    checkVisible(walkToMessage(midElement, 'previousElementSibling'))
    || checkVisible(walkToMessage(midElement, 'nextElementSibling'))
    || checkVisible(firstMessage())
    || checkVisible(lastMessage())
  );
}

/** Returns some message element which is both visible and read, if any. */
function someVisibleReadMessage(top: number, bottom: number): ?Element {
  function checkReadAndVisible(candidate: ?Element): ?Element {
    return candidate && isRead(candidate, top, bottom) && isVisible(candidate, top, bottom)
      ? candidate
      : null;
  }

  // Algorithm: If there's a visible message that isn't read, that means
  // it's partway off the bottom of the screen. Therefore, either:
  // * the message above it will be visible and read, or
  // * there are no visible read messages.
  const visible = someVisibleMessage(top, bottom);
  if (!visible) {
    return visible;
  }
  return checkReadAndVisible(visible) || checkReadAndVisible(previousMessage(visible));
}

/**
 * The Zulip message ID of the given message element; throw if not a message.
 */
function idFromMessage(element: Element): number {
  const idStr = element.getAttribute('data-msg-id');
  if (idStr === null || idStr === undefined) {
    throw new Error('Bad message element');
  }
  return +idStr;
}

/**
 * Returns the IDs of the first and last visible read messages, if any.
 *
 * If no messages are both visible and read, the return value has first > last.
 */
function visibleReadMessageIds(): {| first: number, last: number |} {
  // Algorithm: We find some message that's both visible and read; then walk
  // both up and down from there to find all the visible read messages.

  const top = 0;
  const bottom = viewportHeight;
  let first = Number.MAX_SAFE_INTEGER;
  let last = 0;

  // Walk through visible-and-read elements, observing message IDs.
  function walkElements(start: ?Element, step: 'nextElementSibling' | 'previousElementSibling') {
    let element = start;
    while (element && isVisible(element, top, bottom) && isRead(element, top, bottom)) {
      if (element.classList.contains('message')) {
        const id = idFromMessage(element);
        first = Math.min(first, id);
        last = Math.max(last, id);
      }
      // $FlowFixMe[prop-missing]: doesn't use finite type of `step`
      element = element[step];
    }
  }

  const start = someVisibleReadMessage(top, bottom);
  walkElements(start, 'nextElementSibling');
  walkElements(start, 'previousElementSibling');

  return { first, last };
}

/** DEPRECATED */
const getMessageIdFromElement = (element: Element, defaultValue: number = -1): number => {
  const msgElement = element.closest('.msglist-element');
  return msgElement ? +msgElement.getAttribute('data-msg-id') : defaultValue;
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

/**
 * The range of message IDs that were both visible and read whenever we last
 * checked.
 */
let prevMessageRange = visibleReadMessageIds();

const sendScrollMessage = () => {
  const messageRange = visibleReadMessageIds();
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
    // See WebViewOutboundEventScroll for the meanings of these properties.
    offsetHeight: documentBody.offsetHeight,
    innerHeight: window.innerHeight,
    scrollY: window.scrollY,
    startMessageId: rangeHull.first,
    endMessageId: rangeHull.last,
  });
  if (!doNotMarkMessagesAsRead) {
    setMessagesReadAttributes(rangeHull);
  }
  // If there are no visible + read messages (for instance, the entire screen
  // is taken up by a single large message), then we don't want to update
  // prevMessageRange.  This way, if the user scrolled past some messages to
  // get here, then even though `messageRange` was empty this time and so we
  // didn't mark any messages as read just now, we'll include those in
  // `rangeHull` the next time the user scrolls and so we'll mark them as read
  // then.
  if (messageRange.first < messageRange.last) {
    prevMessageRange = messageRange;
  }
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

/*
 *
 * Updating message content, and re-scrolling
 *
 */

type ScrollTarget =
  | {| type: 'none' |}
  | {| type: 'bottom' |}
  | {| type: 'anchor', messageId: number | null |}
  | {| type: 'preserve', msgId: number, prevBoundTop: number |};

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

/**
 * Run a function after layout properties have updated from DOM changes.
 *
 * This is important if we have just set innerHTML and need to read
 * properties like `scrollHeight` from the DOM, as the re-layout may happen
 * asynchronously.
 */
const runAfterLayout = (fn: () => void) => {
  if (platformOS === 'android') {
    // On Android/Chrome, empirically the updates happen synchronously, so
    // there's no need to delay.  See discussion:
    //   https://github.com/zulip/zulip-mobile/pull/4370
    fn();
    return;
  }

  // On iOS/Safari, we must wait.  See:
  //   https://macarthur.me/posts/when-dom-updates-appear-to-be-asynchronous
  requestAnimationFrame(() => {
    // this runs immediately before the next repaint
    fn();
  });
};

const handleInboundEventContent = (uevent: WebViewInboundEventContent) => {
  const { updateStrategy } = uevent;
  let target: ScrollTarget;
  switch (updateStrategy) {
    case 'replace':
      target = { type: 'none' };
      break;
    case 'scroll-to-anchor':
      target = { type: 'anchor', messageId: uevent.scrollMessageId };
      break;
    case 'scroll-to-bottom-if-near-bottom':
      target = isNearBottom() ? { type: 'bottom' } : findPreserveTarget();
      break;
    case 'preserve-position':
      target = findPreserveTarget();
      break;
    default:
      ensureUnreachable(updateStrategy);
      target = findPreserveTarget();
      break;
  }

  documentBody.innerHTML = uevent.content;

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

// We call this when the webview's content first loads.
export const handleInitialLoad = (
  scrollMessageId: number | null,
  // The `realm` part of an `Auth` object is a URL object. It's passed
  // in its stringified form.
  rawAuth: {| ...$Diff<Auth, {| realm: mixed |}>, realm: string |},
) => {
  const auth: Auth = { ...rawAuth, realm: new URL(rawAuth.realm) };

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

const handleInboundEventFetching = (uevent: WebViewInboundEventFetching) => {
  showHideElement('message-loading', uevent.showMessagePlaceholders);
  showHideElement('spinner-older', uevent.fetchingOlder);
  showHideElement('spinner-newer', uevent.fetchingNewer);
};

const handleInboundEventTyping = (uevent: WebViewInboundEventTyping) => {
  const elementTyping = document.getElementById('typing');
  if (elementTyping) {
    elementTyping.innerHTML = uevent.content;
    runAfterLayout(() => scrollToBottomIfNearEnd());
  }
};

let readyRetryInterval: IntervalID | void = undefined;

const signalReadyForEvents = () => {
  sendMessage({ type: 'ready' });

  // Keep retrying sending the ready event, in case the first one is sent while
  // the queue isn't ready. While this isn't something I've observed in testing,
  // we've previously had bugs that were caused by this (for instance, #3078)
  readyRetryInterval = setInterval(() => {
    sendMessage({ type: 'ready' });
  }, 100);
};

/**
 * Stop resending the handshake message once we confirm that the channel is
 * ready.
 */
const handleInboundEventReady = (uevent: WebViewInboundEventReady) => {
  clearInterval(readyRetryInterval);
};

/**
 * Handles messages that have been read outside of the WebView
 */
const handleInboundEventMessagesRead = (uevent: WebViewInboundEventMessagesRead) => {
  if (uevent.messageIds.length === 0) {
    return;
  }
  const selector = uevent.messageIds.map(id => `[data-msg-id="${id}"]`).join(',');
  const messageElements = Array.from(document.querySelectorAll(selector));
  messageElements.forEach(element => {
    element.setAttribute('data-read', 'true');
  });
};

const inboundEventHandlers = {
  content: handleInboundEventContent,
  fetching: handleInboundEventFetching,
  typing: handleInboundEventTyping,
  ready: handleInboundEventReady,
  read: handleInboundEventMessagesRead,
};

// See `handleInitialLoad` for how this gets subscribed to events.
const handleMessageEvent: MessageEventListener = e => {
  scrollEventsDisabled = true;
  // This decoding inverts `base64Utf8Encode`.
  const decodedData = decodeURIComponent(escape(window.atob(e.data)));
  const rawInboundEvents = JSON.parse(decodedData);
  const inboundEvents: WebViewInboundEvent[] = rawInboundEvents.map(inboundEvent => ({
    ...inboundEvent,
    // A URL object doesn't round-trip through JSON; we get the string
    // representation. So, "revive" it back into a URL object.
    ...(inboundEvent.auth
      ? { auth: { ...inboundEvent.auth, realm: new URL(inboundEvent.auth.realm) } }
      : {}),
  }));

  inboundEvents.forEach((uevent: WebViewInboundEvent) => {
    eventLogger.maybeCaptureInboundEvent(uevent);
    // $FlowFixMe[incompatible-type]
    // $FlowFixMe[prop-missing]
    inboundEventHandlers[uevent.type](uevent);
  });
  scrollEventsDisabled = false;
};

/*
 *
 * Handling user touches
 *
 */

/**
 * If the given message is muted, reveal it and all consecutive following
 * messages from the same user.
 */
const revealMutedMessages = (message: Element) => {
  let messageNode = message;
  do {
    messageNode.setAttribute('data-mute-state', 'shown');
    messageNode = nextMessage(messageNode);
  } while (messageNode && messageNode.classList.contains('message-brief'));
};

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

  if (target.matches('.avatar-img') || target.matches('.username')) {
    sendMessage({
      type: 'request-user-profile',
      fromUserId: makeUserId(requireNumericAttribute(target, 'data-sender-id')),
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
      userId: makeUserId(requireNumericAttribute(target, 'data-user-id')),
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
      messageId: getMessageIdFromElement(inlineImageLink),
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
      voted: target.classList.contains('self-voted'),
    });
    return;
  }

  if (target.matches('.poll-vote')) {
    const messageElement = target.closest('.message');
    if (!messageElement) {
      throw new Error('Message element not found');
    }
    // This duplicates some logic from PollData.handle.vote.outbound in
    // @zulip/shared/js/poll_data.js, but it's much simpler to just duplicate
    // it than it is to thread a callback all the way over here.
    const current_vote = requireAttribute(target, 'data-voted') === 'true';
    const vote = current_vote ? -1 : 1;
    sendMessage({
      type: 'vote',
      messageId: requireNumericAttribute(messageElement, 'data-msg-id'),
      key: requireAttribute(target, 'data-key'),
      vote,
    });
    target.setAttribute('data-voted', (!current_vote).toString());
    target.innerText = (parseInt(target.innerText, 10) + vote).toString();
    return;
  }

  if (target.matches('time')) {
    const originalText = requireAttribute(target, 'original-text');
    sendMessage({
      type: 'time',
      originalText,
    });
  }

  const closestA = target.closest('a');
  if (closestA) {
    sendMessage({
      type: 'url',
      href: requireAttribute(closestA, 'href'),
      messageId: getMessageIdFromElement(closestA),
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
      messageId: getMessageIdFromElement(target),
      reactionName: requireAttribute(reactionNode, 'data-name'),
    });
    return;
  }

  // Prettier bug on nested ternary
  /* prettier-ignore */
  const targetType = target.matches('.header')
    ? 'header'
    : target.matches('a')
      ? 'link'
      : 'message';
  const messageNode = target.closest('.message');

  if (
    targetType === 'message'
    && messageNode
    && messageNode.getAttribute('data-mute-state') === 'hidden'
  ) {
    revealMutedMessages(messageNode);
    return;
  }

  sendMessage({
    type: 'longPress',
    target: targetType,
    messageId: getMessageIdFromElement(target),
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

// It's possible we could call this earlier, and would see some performance
// benifit from doing so, since js.js takes about 16ms to run on a Pixel 3a.
// However, I don't see that as being worth the possible bugs from things
// loading too early.
signalReadyForEvents();
