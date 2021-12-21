/* @flow strict-local */
import invariant from 'invariant';
import { ensureUnreachable } from '../../generics';

import type { EditSequence } from '../generateInboundEventEditSequence';

// TODO: Put more of the WebView's event-handling code in here.

/**
 * PRIVATE - don't use until we have more test coverage (coming soon)
 */
export function applyEditSequence(editSequence: EditSequence) {
  const msglistElementsDiv = document.querySelector('div#msglist-elements');
  invariant(msglistElementsDiv, 'applyEditSequence: expected msglistElementsDiv');

  editSequence.forEach(edit => {
    switch (edit.type) {
      case 'insert': {
        // TODO: Performance in the common case of many consecutive inserts:
        //   https://github.com/zulip/zulip-mobile/pull/5188#discussion_r793030286
        const newChild = document.createElement('div');
        msglistElementsDiv.insertBefore(newChild, msglistElementsDiv.children[edit.index] ?? null);
        newChild.outerHTML = edit.html;
        break;
      }
      case 'replace': {
        const fragment = document.createDocumentFragment();
        const newChild = document.createElement('div');
        fragment.appendChild(newChild);
        newChild.outerHTML = edit.html;

        // Use a DocumentFragment so that the old element gets replaced
        // atomically with the intended new one, without an intermediate
        // state where it's been replaced by an empty div.
        //
        // …Why not skip the DocumentFragment and just set `.outerHTML`
        // before calling `.replaceWith`? Because if an element doesn't
        // already have a parent, then setting `.outerHTML` on it won't
        // work:
        //   https://w3c.github.io/DOM-Parsing/#dom-element-outerhtml
        msglistElementsDiv.replaceChild(fragment, msglistElementsDiv.children[edit.index]);
        break;
      }
      case 'delete': {
        msglistElementsDiv.removeChild(msglistElementsDiv.children[edit.index]);
        break;
      }
      default: {
        ensureUnreachable(edit.type);
        throw new Error(`unexpected edit type: ${edit.type}`);
      }
    }
  });
}
