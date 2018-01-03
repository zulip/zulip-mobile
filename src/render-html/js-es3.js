export default `
'use strict';

window.onerror = function (message, source, line, column, error) {
  var obj = JSON.stringify(error);
  alert('Message: ' + message + ' Source: ' + source + ' Line: ' + line + ' Column: ' + column + ' Error: ' + obj);

  return false;
};

var documentBody = document.body;
var elementMessageList = document.getElementById('message-list');
var elementSpinnerOlder = document.getElementById('spinner-older');
var elementSpinnerNewer = document.getElementById('spinner-newer');
var elementTyping = document.getElementById('typing');
var elementMessageLoading = document.getElementById('message-loading');

if (!documentBody || !elementMessageList || !elementSpinnerOlder || !elementSpinnerNewer || !elementTyping) {
  throw new Error('HTML elements missing');
}

var sendMessage = function sendMessage(msg) {
  window.postMessage(JSON.stringify(msg), '*');
};

var getMessageNode = function getMessageNode(node) {
  var curNode = node;
  while (curNode && curNode.parentNode && curNode.parentNode.id !== 'message-list') {
    curNode = curNode.parentNode;
  }
  return curNode;
};

var getMessageIdFromNode = function getMessageIdFromNode(node) {
  var msgNode = getMessageNode(node);
  return msgNode && msgNode.getAttribute('data-msg-id');
};

var scrollToBottom = function scrollToBottom() {
  window.scrollTo(0, documentBody.scrollHeight);
};

var scrollToBottomIfNearEnd = function scrollToBottomIfNearEnd() {
  if (documentBody.scrollHeight - 100 < documentBody.scrollTop + documentBody.clientHeight) {
    scrollToBottom();
  }
};

var scrollToAnchor = function scrollToAnchor(anchor) {
  var anchorNode = document.getElementById('msg-' + anchor);
  if (anchorNode) {
    anchorNode.scrollIntoView(false);
  } else {
    scrollToBottom();
  }
};

var height = documentBody.clientHeight;
window.addEventListener('resize', function (event) {
  var difference = height - documentBody.clientHeight;
  if (difference > 0 || documentBody.scrollHeight !== documentBody.scrollTop + documentBody.clientHeight) {
    window.scrollBy(0, difference);
  }
  height = documentBody.clientHeight;
});

document.addEventListener('message', function (e) {
  var msg = JSON.parse(e.data);
  switch (msg.type) {
    case 'bottom':
      scrollToBottom();
      break;
    case 'content':
      elementMessageList.innerHTML = msg.content;
      scrollToAnchor(msg.anchor);
      break;
    case 'fetching':
      elementMessageLoading.classList.toggle('hidden', !msg.isFetching);
      elementSpinnerOlder.classList.toggle('hidden', !msg.fetchingOlder);
      elementSpinnerNewer.classList.toggle('hidden', !msg.fetchingNewer);
      break;
    case 'typing':
      elementTyping.innerHTML = msg.content;
      setTimeout(function () {
        return scrollToBottomIfNearEnd();
      });
      break;
    default:
  }
});

window.addEventListener('scroll', function () {
  var startNode = getMessageNode(document.elementFromPoint(200, 20));
  var endNode = getMessageNode(document.elementFromPoint(200, window.innerHeight - 50));
  console.log(startNode, endNode);

  window.postMessage(JSON.stringify({
    type: 'scroll',
    scrollY: window.scrollY,
    innerHeight: window.innerHeight,
    offsetHeight: documentBody.offsetHeight
  }), '*');
});

documentBody.addEventListener('click', function (e) {
  sendMessage({
    type: 'click',
    target: e.target,
    targetNodeName: e.target.nodeName,
    targetClassName: e.target.className,
    matches: e.target.matches('a[target="_blank"] > img')
  });

  if (e.target.matches('.avatar-img')) {
    sendMessage({
      type: 'avatar',
      fromEmail: e.target.getAttribute('data-email')
    });
  }

  if (e.target.matches('.header')) {
    sendMessage({
      type: 'narrow',
      narrow: e.target.getAttribute('data-narrow'),
      id: e.target.getAttribute('data-id')
    });
  }

  if (e.target.matches('a[target="_blank"] > img')) {
    sendMessage({
      type: 'image',
      src: e.target.parentNode.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target)
    });
  } else if (e.target.matches('a')) {
    sendMessage({
      type: 'url',
      href: e.target.getAttribute('href'),
      messageId: +getMessageIdFromNode(e.target)
    });
  }

  if (e.target.matches('.reaction')) {
    sendMessage({
      type: 'reaction',
      name: e.target.getAttribute('data-name'),
      messageId: +getMessageIdFromNode(e.target),
      voted: e.target.classList.contains('self-voted')
    });
  }

  return false;
});`;
