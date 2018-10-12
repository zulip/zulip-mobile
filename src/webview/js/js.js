/* @flow */
import type { Auth } from '../../types';
import type {
  WebviewInputMessage,
  MessageInputContent,
  MessageInputFetching,
  MessageInputTyping,
} from '../webViewHandleUpdates';

/**
 * Convert an array-like object to an actual array.
 *
 * A substitute for `Array.from`, which doesn't exist in the WebViews of some
 * of our supported platforms.
 */
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Array-like_objects
const arrayFrom = arrayLike => Array.prototype.slice.call(arrayLike);

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

const sendMessage = (msg: Object) => {
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

let height = documentBody.clientHeight;
window.addEventListener('resize', event => {
  const difference = height - documentBody.clientHeight;
  if (documentBody.scrollHeight !== documentBody.scrollTop + documentBody.clientHeight) {
    window.scrollBy({ left: 0, top: difference });
  }
  height = documentBody.clientHeight;
});

/*
 *
 * Identifying visible messages
 *
 */

const getMessageNode = (node: ?Node): ?Node => {
  let curNode = node;
  while (curNode && curNode.parentNode && curNode.parentNode !== documentBody) {
    curNode = curNode.parentNode;
  }
  return curNode;
};

const getMessageIdFromNode = (node: ?Node, defaultValue: number = -1): number => {
  const msgNode = getMessageNode(node);
  return msgNode && msgNode instanceof Element
    ? +msgNode.getAttribute('data-msg-id')
    : defaultValue;
};

const getStartAndEndNodes = (): { start: number, end: number } => {
  const startNode = getMessageNode(document.elementFromPoint(200, 20));
  const endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 20));

  return {
    start: getMessageIdFromNode(startNode, Number.MAX_SAFE_INTEGER),
    end: getMessageIdFromNode(endNode, 0),
  };
};

/*
 *
 * Reporting scrolls to outside, to mark messages as read
 *
 */

let prevNodes = getStartAndEndNodes();

const sendScrollMessage = () => {
  const currentNodes = getStartAndEndNodes();

  sendMessage({
    type: 'scroll',
    // See MessageListEventScroll for the meanings of these properties.
    offsetHeight: documentBody.offsetHeight,
    innerHeight: window.innerHeight,
    scrollY: window.scrollY,
    startMessageId: Math.min(prevNodes.start, currentNodes.start),
    endMessageId: Math.max(prevNodes.end, currentNodes.end),
  });
  prevNodes = currentNodes;
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

let lastTouchEventTimestamp = 0;
let lastTouchPositionX = -1;
let lastTouchPositionY = -1;

const handleScrollEvent = () => {
  lastTouchEventTimestamp = 0;
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
  // TODO magic numbers
  const msgNode = getMessageNode(document.elementFromPoint(200, 50));
  if (!msgNode || !(msgNode instanceof HTMLElement)) {
    // TODO log this -- it's an error which the user will notice.
    // (We don't attempt this unless there are messages already,
    // which we really want to keep steady in view.)
    return { type: 'none' };
  }
  const msgId = getMessageIdFromNode(msgNode);
  const prevBoundRect = msgNode.getBoundingClientRect();
  return { type: 'preserve', msgId, prevBoundTop: prevBoundRect.top };
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
    if (!(srcPath.startsWith('/user_uploads/') || srcPath.startsWith('/thumbnail?'))) {
      return;
    }

    const delimiter = img.src.includes('?') ? '&' : '?';
    img.src += `${delimiter}api_key=${auth.apiKey}`;
  });
};

const handleMessageContent = (msg: MessageInputContent) => {
  let target: ScrollTarget;
  if (msg.updateStrategy === 'replace') {
    target = { type: 'none' };
  } else if (msg.updateStrategy === 'scroll-to-anchor') {
    target = { type: 'anchor', anchor: msg.anchor };
  } else if (
    msg.updateStrategy === 'scroll-to-bottom-if-near-bottom'
    && isNearBottom() /* align */
  ) {
    target = { type: 'bottom' };
  } else {
    // including 'default' and 'preserve-position'
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

const handleMessageFetching = (msg: MessageInputFetching) => {
  showHideElement('message-loading', msg.showMessagePlaceholders);
  showHideElement('spinner-older', msg.fetchingOlder);
  showHideElement('spinner-newer', msg.fetchingNewer);
};

const handleMessageTyping = (msg: MessageInputTyping) => {
  const elementTyping = document.getElementById('typing');
  if (elementTyping) {
    elementTyping.innerHTML = msg.content;
    setTimeout(() => scrollToBottomIfNearEnd());
  }
};

const messageHandlers = {
  content: handleMessageContent,
  fetching: handleMessageFetching,
  typing: handleMessageTyping,
};

document.addEventListener('message', e => {
  scrollEventsDisabled = true;
  // $FlowFixMe
  const decodedData = decodeURIComponent(escape(window.atob(e.data)));
  const messages: WebviewInputMessage[] = JSON.parse(decodedData);
  messages.forEach((msg: WebviewInputMessage) => {
    // $FlowFixMe
    messageHandlers[msg.type](msg);
  });
  scrollEventsDisabled = false;
});

/*
 *
 * Handling user touches
 *
 */

documentBody.addEventListener('click', (e: MouseEvent) => {
  e.preventDefault();
  lastTouchEventTimestamp = 0;

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
      fromEmail: target.getAttribute('data-email'),
    });
    return;
  }

  if (target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: target.getAttribute('data-narrow'),
      id: target.getAttribute('data-id'),
    });
    return;
  }

  /* Should we pull up the lightbox?  For comparison, see the webapp's
   * static/js/lightbox.js , starting at the `#main_div` click handler. */
  const inlineImageLink = target.closest('.message_inline_image a');
  if (
    inlineImageLink
    /* The webapp displays certain videos inline, but on mobile
     * we'd rather let another app handle them, as links. */
    && !inlineImageLink.closest('.youtube-video, .vimeo-video')
  ) {
    sendMessage({
      type: 'image',
      src: inlineImageLink.getAttribute('href'), // TODO: should be `src` / `data-src-fullsize`.
      messageId: getMessageIdFromNode(inlineImageLink),
    });
    return;
  }

  if (target.matches('a')) {
    sendMessage({
      type: 'url',
      href: target.getAttribute('href'),
      messageId: getMessageIdFromNode(target),
    });
    return;
  }

  if (target.parentNode instanceof Element && target.parentNode.matches('a')) {
    sendMessage({
      type: 'url',
      href: target.parentNode.getAttribute('href'),
      messageId: getMessageIdFromNode(target.parentNode),
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
      voted: target.classList.contains('self-voted'),
    });
  }
});

const handleLongPress = (target: Element) => {
  // The logic that defines a "long press" in terms of raw touch events
  // is pretty subtle.  The `lastTouchEventTimestamp` and surrounding logic
  // are an attempt to define a long press.
  //
  // TODO: The logic around this "timestamp" is a bit obscure; it's
  // sometimes a real timestamp, other times 0 as sort of a boolean flag.
  // It would be good to clean it up to be clearer.
  //
  // At the same time, the logic is believed not to cover all the cases it
  // should; for example, multitouch events.  Better would be to either find
  // a library we can use which strives to handle all that complexity, or
  // get long-press events from the platform.
  if (!lastTouchEventTimestamp || Date.now() - lastTouchEventTimestamp < 500) {
    return;
  }

  lastTouchEventTimestamp = 0;

  sendMessage({
    type: 'longPress',
    target: target.matches('.header') ? 'header' : 'message',
    messageId: getMessageIdFromNode(target),
  });
};

documentBody.addEventListener('touchstart', (e: TouchEvent) => {
  const { target } = e;
  if (e.changedTouches[0].pageX < 20 || !(target instanceof Element)) {
    return;
  }

  lastTouchPositionX = e.changedTouches[0].pageX;
  lastTouchPositionY = e.changedTouches[0].pageY;
  lastTouchEventTimestamp = Date.now();
  setTimeout(() => handleLongPress(target), 500);
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
    lastTouchEventTimestamp = Date.now();
  }
});

documentBody.addEventListener('touchmove', (e: TouchEvent) => {
  lastTouchEventTimestamp = 0;
});

documentBody.addEventListener('drag', (e: DragEvent) => {
  lastTouchEventTimestamp = 0;
});

/*
 *
 * Synchronizing setup with outside
 *
 */

const waitForBridge = () => {
  if (window.postMessage.length === 1) {
    sendMessage({ type: 'ready' });
  } else {
    setTimeout(waitForBridge, 10);
  }
};
waitForBridge();
