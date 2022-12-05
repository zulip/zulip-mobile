/** @jest-environment jest-environment-jsdom-global */
// @flow strict-local

import { assertUsingFakeTimers } from './lib/fakeTimers';

/**
 * This file should not test any part of the application. It exists to test that
 * certain functionality is present in the development environment used to run
 * other tests.
 */

describe('jsdom-global', () => {
  /* All cryptic strings are courtesy of random.org's string generator. */
  test('is reconfigurable', () => {
    const hostname = 'rgi3npqqem36kcabzjct';
    const paths = [
      'AYfhTK8ABTJPrN7pbc8M',
      '8RbKFoRC82El6uop05Xo',
      'npiWKcEuuPw90yVQxISh',
      '0qrkWHiLXTr3TqgTR3RM',
    ];

    global.jsdom.reconfigure({
      url: `https://www.${hostname}.com/${paths.join('/')}/index.html`,
    });

    expect(document.location.host).toContain(hostname);
    paths.forEach(element => {
      expect(document.location.pathname).toContain(element);
    });
  });

  describe('properly resolves a URL', () => {
    // Segments of the source URL.
    const protocol = 'https';
    const hostname = 'jmur7s0lluxumpbgg7kq';
    const path = 'nDYYQXuN2yaOe6JQiN0q';
    const file = 'gp36FBqcuUxGHgQn9aDX';

    // The source URL itself, which later URL references will be resolved
    // relative to.
    const sourceURL = `${protocol}://www.${hostname}.com/${path}/${file}`;

    // Auxiliary function: given a URL, how many of the above segments does it
    // share with the sourceURL?
    const matchCount: (s: string) => number = (() => {
      const vals = [protocol, hostname, path, file];
      return (s: string) => vals.reduce((c, val) => c + s.includes(val), 0);
    })();

    // Test data, as a series of tuples:
    //  [human-readable-reference-type, url-reference, expected-match-count]
    const data: [string, string, number][] = [
      ['document-internal', '#anchors-aweigh', 4],
      ['immediate', '.', 3],
      ['path-relative', 'index2.html', 3],
      ['explicitly-path-relative', './wat.jpg', 3],
      ['root-relative', '/an/arbitrary/path.mp3', 2],
      ['protocol-relative', '//github.com/zulip/zulip-mobile/', 1],
      ['absolute', 'file:///bin/sh', 0],
    ];

    for (const [urlType, url, expectedCount] of data) {
      test(`from a(n) ${urlType} URL`, () => {
        global.jsdom.reconfigure({ url: sourceURL });

        // implicitly resolve URL via an anchor-element's `href`
        const link: HTMLAnchorElement = document.createElement('a');
        link.href = url;
        const result: string = link.href;

        expect(matchCount(result)).toBe(expectedCount);
      });
    }
  });
});

describe('Jest fake timers', () => {
  assertUsingFakeTimers();

  afterEach(() => {
    // clear any unset timers
    jest.clearAllTimers();
  });

  test('Date.now() is mocked', () => {
    const start = Date.now();
    jest.advanceTimersByTime(5.5e9); // ~63.66 days
    const end = Date.now();

    const apparentDuration = end - start;

    expect(apparentDuration).toBeGreaterThan(5e9);
    expect(apparentDuration).toBeLessThan(6e9);
  });

  test('setInterval is triggered', () => {
    let count = 0;
    setInterval(() => {
      ++count;
    }, 1e9);

    jest.advanceTimersByTime(5.5e9);

    expect(count).toBe(5);
  });

  test('setTimeout is triggered', () => {
    let flag = false;

    setTimeout(() => {
      flag = true;
    }, 3e6);
    setTimeout(() => {
      flag = false;
    }, 6e6);

    jest.advanceTimersByTime(4.5e6);

    expect(flag).toBe(true);
  });

  test('timer count is properly maintained', () => {
    expect(jest.getTimerCount()).toBe(0);
    setInterval(() => {}, 10);
    setInterval(() => {}, 10);
    setInterval(() => {}, 10);
    setInterval(() => {}, 10);
    setInterval(() => {}, 10);

    expect(jest.getTimerCount()).toBe(5);

    setTimeout(() => {}, 10);
    setTimeout(() => {}, 10);
    setTimeout(() => {}, 10);
    setTimeout(() => {}, 10);
    setTimeout(() => {}, 10);

    expect(jest.getTimerCount()).toBe(10);

    jest.advanceTimersByTime(20);
    expect(jest.getTimerCount()).toBe(5);

    jest.clearAllTimers();
    expect(jest.getTimerCount()).toBe(0);
  });

  test('runOnlyPendingTimers runs timers as expected', () => {
    const start = Date.now();

    // set up eternal interval
    let count = 0;
    const interval = 10;
    setInterval(() => ++count, interval);

    const maxTime = 1000;

    // set up several timeouts, of length at most `maxTime`
    const timeOuts = 37;
    for (const k of Array(timeOuts).keys()) {
      setTimeout(() => {}, ((k + 1) / timeOuts) * maxTime);
    }

    jest.runOnlyPendingTimers();
    const end = Date.now();

    // A long time has passed...
    expect(end - start).toBeGreaterThanOrEqual(maxTime);
    // ... only the interval timer is still active...
    expect(jest.getTimerCount()).toBe(1);
    // ... and it has been fired appropriately many times.
    expect(count).toBeCloseTo((end - start) / interval, 1);
  });
});
