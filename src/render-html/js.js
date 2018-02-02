let scrollEventsDisabled = true;
let lastTouchEventTimestamp = 0;
let lastTouchPositionX = null;
let lastTouchPositionY = null;

const sendMessage = msg => {
  window.postMessage(JSON.stringify(msg), '*');
};

const isNearByPositions = (x1, y1, x2, y2) =>
  x1 && y1 && x2 && y2 && Math.abs(x1 - x2) < 10 && Math.abs(y1 - y2) < 10;

const getMessageNode = node => {
  let curNode = node;
  while (curNode && curNode.parentNode && curNode.parentNode !== document.body) {
    curNode = curNode.parentNode;
  }
  return curNode;
};

const getMessageIdFromNode = node => {
  const msgNode = getMessageNode(node);
  return msgNode && msgNode.getAttribute('data-msg-id');
};

const scrollToBottom = () => {
  window.scroll({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' });
};

const isNearBottom = () =>
  document.body.scrollHeight - 100 < document.body.scrollTop + document.body.clientHeight;

const scrollToBottomIfNearEnd = () => {
  if (isNearBottom()) {
    scrollToBottom();
  }
};

const scrollToAnchor = anchor => {
  const anchorNode = document.getElementById(`msg-${anchor}`);

  if (anchorNode) {
    anchorNode.scrollIntoView({ block: 'start' });
  } else {
    window.scroll({ left: 0, top: document.body.scrollHeight + 200 });
  }
};

let height = document.body.clientHeight;
window.addEventListener('resize', event => {
  const difference = height - document.body.clientHeight;
  if (document.body.scrollHeight !== document.body.scrollTop + document.body.clientHeight) {
    window.scrollBy({ left: 0, top: difference });
  }
  height = document.body.clientHeight;
});

const handleMessageBottom = msg => {
  scrollToBottom();
};

const handleMessageContent = msg => {
  const msgNode = document.getElementById(`msg-${msg.anchor}`);

  scrollEventsDisabled = true;
  if (msg.noMessages) {
    document.body.innerHTML = msg.content;
  } else if (!msgNode) {
    document.body.innerHTML = msg.content;
    scrollToAnchor(msg.anchor);
  } else if (isNearBottom() && msg.messageDiff === 1) {
    document.body.innerHTML = msg.content;
    scrollToBottom();
  } else {
    const prevBoundRect = msgNode.getBoundingClientRect();
    document.body.innerHTML = msg.content;
    const newElement = document.getElementById(`msg-${msg.anchor}`);
    if (newElement) {
      const newBoundRect = newElement.getBoundingClientRect();
      window.scrollBy(0, newBoundRect.top - prevBoundRect.top);
    }
  }
  scrollEventsDisabled = false;
};

const handleMessageFetching = msg => {
  document
    .getElementById('message-loading')
    .classList.toggle('hidden', !msg.showMessagePlaceholders);
  document.getElementById('spinner-older').classList.toggle('hidden', !msg.fetchingOlder);
  document.getElementById('spinner-newer').classList.toggle('hidden', !msg.fetchingNewer);
};

const handleMessageTyping = msg => {
  document.getElementById('typing').innerHTML = msg.content;
  setTimeout(() => scrollToBottomIfNearEnd());
};

const handleLongPress = e => {
  if (!lastTouchEventTimestamp || Date.now() - lastTouchEventTimestamp < 500) return;

  lastTouchEventTimestamp = 0;

  sendMessage({
    type: 'longPress',
    target: e.target.matches('.header') ? 'header' : 'message',
    messageId: +getMessageIdFromNode(e.target),
  });
};

document.addEventListener('message', e => {
  const msg = JSON.parse(e.data);
  switch (msg.type) {
    case 'bottom':
      handleMessageBottom(msg);
      break;
    case 'content':
      handleMessageContent(msg);
      break;
    case 'fetching':
      handleMessageFetching(msg);
      break;
    case 'typing':
      handleMessageTyping(msg);
      break;
    default:
  }
});

const isMessageNode = node => node && node.getAttribute && node.hasAttribute('data-msg-id');

const getStartAndEndNodes = () => {
  const startNode = getMessageNode(document.elementFromPoint(200, 20));
  const endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 20));

  return {
    start: isMessageNode(startNode) ? startNode.getAttribute('data-msg-id') : 0,
    end: isMessageNode(endNode) ? endNode.getAttribute('data-msg-id') : Number.MAX_SAFE_INTEGER,
  };
};

let prevNodes = getStartAndEndNodes();

window.addEventListener('scroll', () => {
  lastTouchEventTimestamp = 0;
  if (scrollEventsDisabled) return;

  const currentNodes = getStartAndEndNodes();

  window.postMessage(
    JSON.stringify({
      type: 'scroll',
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      offsetHeight: document.body.offsetHeight,
      startMessageId: Math.min(prevNodes.start, currentNodes.start),
      endMessageId: Math.max(prevNodes.end, currentNodes.end),
    }),
    '*',
  );

  prevNodes = currentNodes;
});

document.body.addEventListener('click', e => {
  e.preventDefault();
  lastTouchEventTimestamp = 0;
  if (e.target.matches('.avatar-img')) {
    sendMessage({
      type: 'avatar',
      fromEmail: e.target.getAttribute('data-email'),
    });
  }

  if (e.target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: e.target.getAttribute('data-narrow'),
      id: e.target.getAttribute('data-id'),
    });
  }

  if (e.target.matches('a[target="_blank"] > img')) {
    sendMessage({
      type: 'image',
      src: e.target.parentNode.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target),
    });
  } else if (e.target.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target),
    });
  }

  if (e.target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: e.target.getAttribute('data-name'),
      messageId: +getMessageIdFromNode(e.target),
      voted: e.target.classList.contains('self-voted'),
    });
  }
});

document.body.addEventListener('touchstart', e => {
  if (e.changedTouches[0].pageX < 20) return;

  lastTouchPositionX = e.changedTouches[0].pageX;
  lastTouchPositionY = e.changedTouches[0].pageY;
  lastTouchEventTimestamp = Date.now();
  setTimeout(() => handleLongPress(e), 500);
});

document.body.addEventListener('touchend', e => {
  if (
    isNearByPositions(
      lastTouchPositionX,
      lastTouchPositionY,
      e.changedTouches[0].pageX,
      e.changedTouches[0].pageY,
    )
  ) {
    lastTouchEventTimestamp = Date.now();
  }
});

document.body.addEventListener('touchmove', e => {
  lastTouchEventTimestamp = 0;
});

document.body.addEventListener('drag', e => {
  lastTouchEventTimestamp = 0;
});
