/* @flow strict-local */

/**
 * Collapse an open spoiler block with animation.
 *
 * Does what `collapse_spoiler` in static/js/spoilers.js in the web
 * does, only departing as appropriate to adapt to mobile.
 */
const collapseSpoiler = (spoiler: HTMLElement) => {
  // Translation of zulip/zulip@f3011d3b7 out of jQuery. We need
  // `spoiler`'s computed content height, which excludes padding.
  // Things like `clientHeight` and `offsetHeight` include padding.
  const computedHeight = getComputedStyle(spoiler).height;

  // Set height to rendered height on next frame, then to zero on following
  // frame to allow CSS transition animation to work
  requestAnimationFrame(() => {
    spoiler.style.height = computedHeight;
    spoiler.classList.remove('spoiler-content-open');

    requestAnimationFrame(() => {
      spoiler.style.height = '0px';
    });
  });
};

/**
 * Expand a closed spoiler block with animation.
 *
 * Does what `expand_spoiler` in static/js/spoilers.js in the web app
 * does, only departing as appropriate to adapt to mobile.
 */
const expandSpoiler = (spoiler: HTMLElement) => {
  // Normally, the height of the spoiler block is not defined
  // absolutely on the `spoiler-content-open` class, but just set to
  // `auto` (i.e. the height of the content). CSS animations do not
  // work with properties set to `auto`, so we get the actual height
  // of the content here and temporarily put it explicitly on the
  // element styling to allow the transition to work.
  const spoilerHeight = spoiler.scrollHeight;
  spoiler.style.height = `${spoilerHeight}px`;
  // The `spoiler-content-open` class has CSS animations defined on it which
  // will trigger on the frame after this class change.
  spoiler.classList.add('spoiler-content-open');

  const callback = () => {
    spoiler.removeEventListener('transitionend', callback);
    // When the CSS transition is over, reset the height to auto
    // This keeps things working if, e.g., the viewport is resized
    spoiler.style.height = '';
  };
  spoiler.addEventListener('transitionend', callback);
};

/**
 * Toggle the spoiler state - collapsed <-> open.
 *
 * Detects the state of the spoiler block and toggles that.
 */
// The structure we're handling looks like this:
//
// <div class="spoiler-block">
//   <div class="spoiler-header">
//     <span class="spoiler-button" aria-expanded="false">
//       <span class="spoiler-arrow"></span>
//     </span>
//     <p>Always visible heading</p>
//   </div>
//
//   <div class="spoiler-content">
//     <p>This text won't be visible until the user clicks.</p>
//   </div>
// </div>
//
// The above represents what we get from the server plus some tweaks
// that have been made client-side, in `rewriteHtml`. (The web app's
// version of the above can be seen in
// templates/zerver/app/markdown_help.html, the user-facing Markdown
// guide, at c5dc9d386.)
export const toggleSpoiler = (spoilerHeader: HTMLElement) => {
  const spoilerBlock = spoilerHeader.parentElement;
  if (!spoilerBlock) {
    return;
  }

  const button = spoilerHeader.querySelector('.spoiler-button');
  const arrow = spoilerBlock.querySelector('.spoiler-arrow');
  const spoilerContent = spoilerBlock.querySelector('.spoiler-content');
  if (!arrow || !button || !spoilerContent) {
    // eslint-disable-next-line no-console
    console.warn('Malformed spoiler block');
    return;
  }

  if (spoilerContent.classList.contains('spoiler-content-open')) {
    // Content was open, we are collapsing
    arrow.classList.remove('spoiler-button-open');

    // Modify ARIA roles for screen readers
    button.setAttribute('aria-expanded', 'false');
    spoilerContent.setAttribute('aria-hidden', 'true');

    collapseSpoiler(spoilerContent);
  } else {
    // Content was closed, we are expanding
    arrow.classList.add('spoiler-button-open');

    // Modify ARIA roles for screen readers
    button.setAttribute('aria-expanded', 'true');
    spoilerContent.setAttribute('aria-hidden', 'false');

    expandSpoiler(spoilerContent);
  }
};
