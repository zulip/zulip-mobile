/* @flow strict-local */
// $FlowFixMe[untyped-import]
import isEqual from 'lodash.isequal';
import invariant from 'invariant';

import type { MessageListElement, GetText } from '../types';
import { ensureUnreachable } from '../generics';
import type { BackgroundData } from './MessageList';
import messageListElementHtml from './html/messageListElementHtml';

const NODE_ENV = process.env.NODE_ENV;

export type Insert = $ReadOnly<{|
  type: 'insert',
  html: string,
  index: number,
|}>;

export type Delete = $ReadOnly<{|
  type: 'delete',
  index: number,
|}>;

export type Replace = $ReadOnly<{|
  type: 'replace',
  html: string,
  index: number,
|}>;

type Edit = Insert | Delete | Replace;

export type EditSequence = $ReadOnlyArray<Edit>;

/**
 * A compare function to sort a list of MessageListElements by `.key`.
 *
 * See the `MessageListElement.key` type definition.
 */
function compare(a: MessageListElement, b: MessageListElement) {
  const firstResult = Math.sign(a.key[0] - b.key[0]);
  if (firstResult !== 0) {
    return firstResult;
  } else {
    return Math.sign(a.key[1] - b.key[1]);
  }
}

function areElementsInOrder(elements: $ReadOnlyArray<MessageListElement>): boolean {
  return elements.every((elem, i, arr) => i === 0 || compare(arr[i - 1], arr[i]) === -1);
}

/**
 * Check for differences in data belonging to two MessageListElements
 *
 * Ignores all background data that doesn't belong to the two particular
 * elements and could plausibly affect all elements: language, narrow,
 * dark/light theme, current date, user's role (e.g., admin), etc.
 */
function doElementsDifferInterestingly(
  oldElement,
  newElement,
  oldBackgroundData,
  newBackgroundData,
): boolean {
  if (oldElement.type !== newElement.type) {
    return true;
  }
  switch (oldElement.type) {
    case 'time':
      // TODO(?): False positives on `.subsequentMessage.content` changes
      return !isEqual(oldElement, newElement);
    case 'header':
      // TODO(?): False positives on `.subsequentMessage.content` changes
      return !isEqual(oldElement, newElement);
    case 'message': {
      invariant(newElement.type === 'message', 'oldElement.type equals newElement.type');

      return (
        !isEqual(oldElement, newElement)
        // TODO(?): Flags are metadata on a message, not "background data".
        //   Attach them to the MessageListElement object itself, where we
        //   construct it, then simplify this function. It's surprising to
        //   see "background data" in this function's inputs.
        || Object.keys(oldBackgroundData.flags).some(
          flagName =>
            // The WebView updates its "read" state through a different
            // event type, WebViewInboundEventMessagesRead. So, ignore that
            // flag here, but do notice any other flags changing.
            // TODO(?): Maybe actually handle 'read' here? See
            //   https://github.com/zulip/zulip-mobile/pull/5188#discussion_r792992634
            flagName !== 'read'
            && oldBackgroundData.flags[flagName][oldElement.message.id]
              !== newBackgroundData.flags[flagName][newElement.message.id],
        )
      );
    }
    default: {
      ensureUnreachable(oldElement.type);
      throw new Error();
    }
  }
}

/**
 * PRIVATE - don't use until we have more test coverage (coming soon)
 */
export function getEditSequence(
  oldArgs: {|
    backgroundData: BackgroundData,
    elements: $ReadOnlyArray<MessageListElement>,
    _: GetText,
  |},
  newArgs: {|
    backgroundData: BackgroundData,
    elements: $ReadOnlyArray<MessageListElement>,
    _: GetText,
  |},
): EditSequence {
  const { elements: oldElements } = oldArgs;
  const { elements: newElements } = newArgs;

  if (NODE_ENV !== 'production') {
    invariant(areElementsInOrder(oldElements), 'getEditSequence: oldElements not in order');
    invariant(areElementsInOrder(newElements), 'getEditSequence: newElements not in order');
  }

  const hasLanguageChanged = oldArgs._ !== newArgs._;

  const result = [];

  let i = 0;
  let j = 0;
  while (i < oldElements.length && j < newElements.length) {
    const oldElement = oldElements[i];
    const newElement = newElements[j];
    const compareResult = compare(oldElement, newElement);
    if (compareResult < 0) {
      result.push({ type: 'delete', index: j });
      i++;
    } else if (compareResult > 0) {
      result.push({
        type: 'insert',
        index: j,
        html: messageListElementHtml({
          backgroundData: newArgs.backgroundData,
          element: newElement,
          _: newArgs._,
        }),
      });
      j++;
    } else {
      // Predict whether oldElement and newElement would render differently.
      //
      // We avoid the performance hit of actually computing both HTML
      // strings for comparison. Instead, we inspect the inputs of that
      // computation: context that affects how all elements in the list are
      // rendered, and oldElement and newElement themselves.
      //
      // False positives might be acceptable; false negatives are not.
      if (
        // Replace any translated text, like muted-user placeholders.
        hasLanguageChanged
        || doElementsDifferInterestingly(
          oldElement,
          newElement,
          oldArgs.backgroundData,
          newArgs.backgroundData,
        )
      ) {
        result.push({
          type: 'replace',
          index: j,
          html: messageListElementHtml({
            backgroundData: newArgs.backgroundData,
            element: newElement,
            _: newArgs._,
          }),
        });
      }
      i++;
      j++;
    }
  }
  while (j < newElements.length) {
    result.push({
      type: 'insert',
      index: j,
      html: messageListElementHtml({
        backgroundData: newArgs.backgroundData,
        element: newElements[j],
        _: newArgs._,
      }),
    });
    j++;
  }
  while (i < oldElements.length) {
    result.push({ type: 'delete', index: j });
    i++;
  }

  return result;
}
