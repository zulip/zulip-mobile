window.onerror = (message, source, line, column, error) => {
  const obj = JSON.stringify(error);
  alert(`Message: ${message} Source: ${source} Line: ${line} Column: ${column} Error: ${obj}`);

  return false;
};

const documentBody = document.body;
const elementMessageList = document.getElementById('message-list');
const elementSpinnerOlder = document.getElementById('spinner-older');
const elementSpinnerNewer = document.getElementById('spinner-newer');
const elementTyping = document.getElementById('typing');
const elementMessageLoading = document.getElementById('message-loading');

if (
  !documentBody ||
  !elementMessageList ||
  !elementSpinnerOlder ||
  !elementSpinnerNewer ||
  !elementTyping ||
  !elementMessageLoading
) {
  throw new Error('HTML elements missing');
}

const sendMessage = msg => {
  window.postMessage(JSON.stringify(msg), '*');
};

const getMessageNode = node => {
  let curNode = node;
  while (curNode && curNode.parentNode && curNode.parentNode.id !== 'message-list') {
    curNode = curNode.parentNode;
  }
  return curNode;
};

const getMessageIdFromNode = node => {
  const msgNode = getMessageNode(node);
  return msgNode && msgNode.getAttribute('data-msg-id');
};

const scrollTo = (element, to, duration) => {
  if (duration <= 0) return;
  const difference = to - element.scrollTop;
  const perTick = difference / duration * 10;

  setTimeout(() => {
    element.scrollTop += perTick;
    if (element.scrollTop === to) return;
    scrollTo(element, to, duration - 10);
  }, 10);
};

const animatedScrollBy = (element, by, duration) => {
  const step = by / (duration / 16);
  let cur = Math.abs(by);
  const interval = setInterval(() => {
    cur -= step;
    window.scrollBy(0, step);
    if (cur <= 0) clearInterval(interval);
  }, 16);
};

const scrollToBottom = () => {
  window.scrollTo(0, documentBody.scrollHeight);
};

const scrollToBottomIfNearEnd = () => {
  if (documentBody.scrollHeight - 100 < documentBody.scrollTop + documentBody.clientHeight) {
    scrollToBottom();
  }
};

const scrollToAnchor = anchor => {
  const anchorNode = document.getElementById(`msg-${anchor}`);
  if (anchorNode) {
    anchorNode.scrollIntoView(false);
  } else {
    scrollToBottom();
  }
};

let height = documentBody.clientHeight;
window.addEventListener('resize', event => {
  const difference = height - documentBody.clientHeight;
  if (
    difference > 0 ||
    documentBody.scrollHeight !== documentBody.scrollTop + documentBody.clientHeight
  ) {
    window.scrollBy(0, difference);
  }
  height = documentBody.clientHeight;
});

document.addEventListener('message', e => {
  const msg = JSON.parse(e.data);
  switch (msg.type) {
    case 'bottom':
      scrollToBottom();
      break;
    case 'content': {
      const prevPosition = documentBody.scrollTop;
      elementMessageList.innerHTML = msg.content;
      if (msg.anchor) {
        scrollToAnchor(msg.anchor);
      } else {
        documentBody.scrollTop = prevPosition;
      }
      break;
    }
    case 'fetching':
      elementMessageLoading.classList.toggle('hidden', !msg.showMessagePlaceholders);
      elementSpinnerOlder.classList.toggle(
        'hidden',
        !msg.fetchingOlder || msg.showMessagePlaceholders,
      );
      elementSpinnerNewer.classList.toggle(
        'hidden',
        !msg.fetchingNewer || msg.showMessagePlaceholders,
      );
      break;
    case 'typing':
      elementTyping.innerHTML = msg.content;
      setTimeout(() => scrollToBottomIfNearEnd());
      break;
    default:
  }
});

window.addEventListener('scroll', () => {
  const startNode = getMessageNode(document.elementFromPoint(200, 20));
  const endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 50));
  console.log(startNode, endNode);

  window.postMessage(
    JSON.stringify({
      type: 'scroll',
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      offsetHeight: documentBody.offsetHeight,
    }),
    '*',
  );
});

documentBody.addEventListener('click', e => {
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

  return false;
});
