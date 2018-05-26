import { sleep, timeout, tryUntilSuccessful } from '../async';

describe('sleep', () => {
  test('waits for a given time in milliseconds', async () => {
    const start = Date.now();
    await sleep(1000);
    const duration = Date.now() - start;
    expect(duration > 1000 && duration < 1100).toBeTruthy();
  });
});

describe('timeout', () => {
  test('when no parameters passed, there is no timeout', async () => {
    const result = await timeout('hello');
    expect(result).toEqual('hello');
  });

  test('if function takes more than the timeout value, the timeoutCallback is called', async () => {
    const longDurationFunc = new Promise(resolve => setTimeout(resolve, 1000));
    const timeoutCallback = jest.fn();
    await timeout(longDurationFunc, timeoutCallback, 100);
    expect(timeoutCallback).toHaveBeenCalled();
  });

  test('if no timeout value is passed, the default is 10secs', async () => {
    const longDurationFunc = new Promise(resolve => setTimeout(resolve, 100));
    const timeoutCallback = jest.fn();
    await timeout(longDurationFunc, timeoutCallback);
    expect(timeoutCallback).not.toHaveBeenCalled();
  });
});

describe('tryUntilSuccessful', () => {
  test('resolves any value when there is no exception', async () => {
    const result = await tryUntilSuccessful(() => 'hello');

    expect(result).toEqual('hello');
  });

  test('resolves any promise, if there is no exception', async () => {
    const result = await tryUntilSuccessful(
      () => new Promise(resolve => setTimeout(() => resolve('hello'), 100)),
    );

    expect(result).toEqual('hello');
  });

  test('retries a call, if there is an exception', async () => {
    // fail on first call, succeed second time
    let callCount = 0;
    const thrower = () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('First run exception');
      }
      return 'hello';
    };

    const result = await tryUntilSuccessful(() => thrower());

    expect(result).toEqual('hello');
  });

  test('does not retry a call if maxRetries = 0', async () => {
    let callCount = 0;
    const thrower = () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('First run exception');
      }
      return 'hello';
    };

    expect.assertions(1);
    try {
      await tryUntilSuccessful(() => thrower(), 0);
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
});
