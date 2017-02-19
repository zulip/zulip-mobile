import { timeout, tryUntilSuccessful } from '../async';

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
  test('TODO1', async () => {
    const result = await tryUntilSuccessful('hello');

    expect(result).toEqual('hello');
  });

  test('TODO2', async () => {
    let callCount = 0;
    const thrower = async () => {
      callCount++;
      console.log('callCount', callCount);
      if (callCount === 1) throw new Error('Test');
      console.log('returning hello', callCount);
      return 'hello';
    };

    const result = await tryUntilSuccessful(thrower());

    expect(result).toEqual('hello');
  });
});
