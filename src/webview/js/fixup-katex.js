/* @flow strict */

// Auxiliary function, for brevity.
const makeDiv = (className: string): Element => {
  const element = document.createElement('div');
  element.classList.add(className);
  return element;
};

/**
 * Adjust non-inline KaTeX equation element structure.
 *
 * This surrounds existing `.katex-display` elements (the KaTeX wrapper for
 * non-inline equations) with shim `<div>`s to allow horizontal scrolling.
 *
 * (The actual functionality of these elements is provided by CSS rules.)
 */
const fixupKatex = (root: Element) => {
  Array.from(root.querySelectorAll('.katex-display')).forEach(kd => {
    // nodes returned by `querySelectorAll` will always have a valid parent
    // node, since the root node itself is excluded
    const parent: Node = ((kd.parentNode: ?Node): $FlowFixMe);

    // Nest each `.katex-display` element within two new <div> elements.
    // Notionally:
    //   s/ (.katex-display) / div.z-k-outer > div.z-k-inner > $1 /
    const outer = makeDiv('zulip-katex-outer');
    const inner = makeDiv('zulip-katex-inner');

    outer.appendChild(inner);
    parent.replaceChild(outer, kd);
    inner.appendChild(kd);
  });
};

export default fixupKatex;
