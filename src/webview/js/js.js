/* @flow */
import type { Auth } from '../../types';
import type {
  WebviewInputMessage,
  MessageInputContent,
  MessageInputFetching,
  MessageInputTyping,
} from '../webViewHandleUpdates';

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

const showHideElement = (elementId: string, show: boolean) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle('hidden', !show);
  }
};

const isNearPositions = (x1: number = 0, y1: number = 0, x2: number = 0, y2: number = 0): boolean =>
  Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;

const getMessageNode = (node: Node): Node => {
  let curNode = node;
  while (curNode && curNode.parentNode && curNode.parentNode !== documentBody) {
    curNode = curNode.parentNode;
  }
  return curNode;
};

const getMessageIdFromNode = (node: Node, defaultValue: number = -1): number => {
  const msgNode = getMessageNode(node);
  return msgNode && msgNode instanceof Element
    ? +msgNode.getAttribute('data-msg-id')
    : defaultValue;
};

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

let height = documentBody.clientHeight;
window.addEventListener('resize', event => {
  const difference = height - documentBody.clientHeight;
  if (documentBody.scrollHeight !== documentBody.scrollTop + documentBody.clientHeight) {
    window.scrollBy({ left: 0, top: difference });
  }
  height = documentBody.clientHeight;
});

const getLastVisibleMsgIdOnScreen = (
  x: number = 200,
  y: number = window.innerHeight - 20,
): number => {
  if (x < 0 || y < 0) {
    return 0;
  }
  const endNode = getMessageNode(document.elementFromPoint(x, y));
  const msgId = getMessageIdFromNode(endNode, 0);
  return msgId !== 0 ? msgId : getLastVisibleMsgIdOnScreen(x, y - 20);
};

const getStartAndEndNodes = (): { start: number, end: number } => {
  const startNode = getMessageNode(document.elementFromPoint(200, 20));
  const endNodeId = getLastVisibleMsgIdOnScreen();

  return {
    start: getMessageIdFromNode(startNode, Number.MAX_SAFE_INTEGER),
    end: endNodeId,
  };
};

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

type ScrollTarget =
  | { type: 'none' }
  | { type: 'bottom' }
  | { type: 'anchor', anchor: number }
  | { type: 'preserve', msgId: number, prevBoundTop: number };

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
  Array.from(imageTags).forEach(img => {
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

documentBody.addEventListener('click', e => {
  e.preventDefault();
  lastTouchEventTimestamp = 0;

  if (e.target.matches('.scroll-bottom')) {
    scrollToBottom();
    return;
  }

  if (e.target.matches('.avatar-img')) {
    sendMessage({
      type: 'avatar',
      fromEmail: e.target.getAttribute('data-email'),
    });
    return;
  }

  if (e.target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: e.target.getAttribute('data-narrow'),
      id: e.target.getAttribute('data-id'),
    });
    return;
  }

  if (e.target.matches('a[target="_blank"] > img')) {
    sendMessage({
      type: 'image',
      src: e.target.parentNode.getAttribute('href'),
      messageId: getMessageIdFromNode(e.target),
    });
    return;
  }

  if (e.target.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.getAttribute('href'),
      messageId: getMessageIdFromNode(e.target),
    });
    return;
  }

  if (e.target.parentNode.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.parentNode.getAttribute('href'),
      messageId: getMessageIdFromNode(e.target.parentNode),
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
      voted: e.target.classList.contains('self-voted'),
    });
  }
});

const handleLongPress = e => {
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
    target: e.target.matches('.header') ? 'header' : 'message',
    messageId: getMessageIdFromNode(e.target),
  });
};

documentBody.addEventListener('touchstart', e => {
  if (e.changedTouches[0].pageX < 20) {
    return;
  }

  lastTouchPositionX = e.changedTouches[0].pageX;
  lastTouchPositionY = e.changedTouches[0].pageY;
  lastTouchEventTimestamp = Date.now();
  setTimeout(() => handleLongPress(e), 500);
});

documentBody.addEventListener('touchend', e => {
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

documentBody.addEventListener('touchmove', e => {
  lastTouchEventTimestamp = 0;
});

documentBody.addEventListener('drag', e => {
  lastTouchEventTimestamp = 0;
});

const waitForBridge = () => {
  if (window.postMessage.length === 1) {
    sendMessage({ type: 'ready' });
  } else {
    setTimeout(waitForBridge, 10);
  }
};
waitForBridge();
