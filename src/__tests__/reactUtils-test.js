/* @flow strict-local */
import React from 'react';
import type { ComponentType } from 'react';
// $FlowFixMe[untyped-import]
import { create, act } from 'react-test-renderer';

import { fakeSleep } from './lib/fakeTimers';
import { useHasStayedTrueForMs } from '../reactUtils';

describe('useHasStayedTrueForMs', () => {
  /**
   * Simulate a mock component using the hook, and inspect hook's value.
   *
   * - The constructor mounts the component. (`ms` won't change through the
   *   lifetime of the TestMachine instance.)
   * - Use `updateValue` to change the `value` arg passed to the hook.
   * - Use `hookOutput` to get the return value of the hook from the latest
   *   render.
   * - (Important) To wait for a duration, use the instance's `sleep` method
   *   instead of the util `fakeSleep` or similar. It wraps some
   *   `react-test-renderer` boilerplate.
   * - When done, call 'cleanup'.
   *
   * Encapsulates a few things:
   * - react-test-renderer is untyped (so far)
   * - boilerplate for using react-test-renderer, like calling `act`
   *   repeatedly
   * - boring details like how the mock component is implemented
   */
  // I'm not totally clear on everything `act` does, but react-test-renderer
  // seems to recommend it strongly enough that we actually get errors if we
  // don't use it. Following links --
  //   https://reactjs.org/docs/test-renderer.html#testrendereract
  //   https://reactjs.org/docs/test-utils.html#act
  //   https://reactjs.org/docs/testing-recipes.html
  // -- I see the following, which I think does the best job of explaining.
  // (The `act` in `react-dom/test-utils` might not be identical to the
  // `act` in `react-test-renderer`, but `react-test-renderer` says they're
  // similar.)
  // > When writing UI tests, tasks like rendering, user events, or data
  // > fetching can be considered as “units” of interaction with a user
  // > interface. `react-dom/test-utils` provides a helper called `act()`
  // > that makes sure all updates related to these “units” have been
  // > processed and applied to the DOM before you make any assertions
  class TestMachine {
    static HOOK_VALUE_TRUE = 'HOOK_VALUE_TRUE';
    static HOOK_VALUE_FALSE = 'HOOK_VALUE_FALSE';

    _TestComponent: ComponentType<{| value: boolean |}>;
    _testRenderer: $FlowFixMe;

    constructor(ms: number, initialValue: boolean) {
      this._TestComponent = function _TestComponent(props: {| value: boolean |}) {
        const hookOutput = useHasStayedTrueForMs(props.value, ms);
        return hookOutput ? TestMachine.HOOK_VALUE_TRUE : TestMachine.HOOK_VALUE_FALSE;
      };
      this._testRenderer = this._createTestRenderer(initialValue);
    }

    updateValue(value: boolean) {
      this._updateTestRenderer(value);
    }

    hookOutput() {
      const result = this._testRenderer.root.children[0] === TestMachine.HOOK_VALUE_TRUE;
      return result;
    }

    // eslint-disable-next-line class-methods-use-this
    async sleep(ms: number): Promise<void> {
      // `fakeSleep` causes the timer to run, which causes the hook to set
      // some state (with `useState`). `react-test-renderer` says we need to
      // use `act` to be sure the state update is processed before we start
      // making assertions.
      return act(() => fakeSleep(ms));
    }

    cleanup() {
      // https://reactjs.org/docs/test-renderer.html#testrendererunmount
      this._testRenderer.unmount();
    }

    _createTestRenderer(initialValue: boolean) {
      const TestComponent = this._TestComponent;
      let testRenderer;
      act(() => {
        // https://reactjs.org/docs/test-renderer.html#testrenderercreate
        testRenderer = create(<TestComponent value={initialValue} />);
      });
      return testRenderer;
    }

    _updateTestRenderer(value: boolean) {
      const TestComponent = this._TestComponent;
      act(() => {
        // https://reactjs.org/docs/test-renderer.html#testrendererupdate
        this._testRenderer.update(<TestComponent value={value} />);
      });
    }
  }

  const MS = 1000;

  /**
   * Simulate the input value changing over time, checking the hook's output.
   *
   * On each item in the `sequence`, this will:
   * 1. Wait for a specified time
   * 2. Read and assert the hook's output from the last render, as specified
   * 3. Render again, with the specified input for the hook
   */
  // Tell ESLint to recognize `testSequence` as a helper function that runs
  // assertions.
  /* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect", "testSequence"] }] */
  const testSequence = async (args: {
    description: string,
    initialValue: boolean,
    sequence: $ReadOnlyArray<{|
      waitBefore: number,
      expectedOutput: boolean,
      thenUpdateInputTo?: boolean,
    |}>,
  }) => {
    const { initialValue, sequence } = args;
    const testMachine = new TestMachine(MS, initialValue);

    // Should never be true before any time has passed.
    expect(testMachine.hookOutput()).toBeFalse();

    for (let i = 0; i < sequence.length; i++) {
      const { waitBefore, expectedOutput, thenUpdateInputTo } = sequence[i];
      await testMachine.sleep(waitBefore);
      expect(testMachine.hookOutput()).toBe(expectedOutput);
      if (thenUpdateInputTo !== undefined) {
        testMachine.updateValue(thenUpdateInputTo);
      }
    }

    testMachine.cleanup();
  };

  const sequencesToTest = [
    {
      description: 'start false, wait long time',
      initialValue: false,
      sequence: [{ waitBefore: 2 * MS, expectedOutput: false }],
    },
    {
      description: 'start false, wait short time',
      initialValue: false,
      sequence: [{ waitBefore: MS / 2, expectedOutput: false }],
    },
    {
      description: 'change to true, wait long time, change back to false',
      initialValue: false,
      sequence: [
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: 2 * MS, expectedOutput: true, thenUpdateInputTo: false },
        { waitBefore: MS / 2, expectedOutput: false },
        { waitBefore: MS, expectedOutput: false },
      ],
    },
    {
      description: 'start false, quickly back and forth between true and false',
      initialValue: false,
      sequence: [
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: 2 * MS, expectedOutput: false },
      ],
    },
    {
      description: 'start false, repeatedly set to false in quick succession',
      initialValue: false,
      sequence: [
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: false },
      ],
    },
    {
      description: 'start true, wait short time',
      initialValue: true,
      sequence: [{ waitBefore: MS / 2, expectedOutput: false }],
    },
    {
      description: 'start true, wait long time',
      initialValue: true,
      sequence: [{ waitBefore: 2 * MS, expectedOutput: true }],
    },
    {
      description: 'start true, switch to false after short time, wait longer',
      initialValue: true,
      sequence: [
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS, expectedOutput: false },
      ],
    },
    {
      description: 'start true, switch to false after long time',
      initialValue: true,
      sequence: [
        { waitBefore: 2 * MS, expectedOutput: true, thenUpdateInputTo: false },
        { waitBefore: MS / 2, expectedOutput: false },
        { waitBefore: MS, expectedOutput: false },
      ],
    },
    {
      description: 'start true, quickly back and forth between true and false',
      initialValue: true,
      sequence: [
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 2, expectedOutput: false, thenUpdateInputTo: false },
        { waitBefore: 2 * MS, expectedOutput: false },
      ],
    },
    {
      description: 'start true, repeatedly set to true in quick succession',
      initialValue: true,
      sequence: [
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 5, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 5 - 1, expectedOutput: false, thenUpdateInputTo: true },
        { waitBefore: MS / 5 + 1, expectedOutput: true },
      ],
    },
  ];

  for (let i = 0; i < sequencesToTest.length; i++) {
    const currentSequence = sequencesToTest[i];
    test(currentSequence.description, async () => {
      await testSequence(currentSequence);
    });
  }
});
