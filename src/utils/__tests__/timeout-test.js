import timeout from '../timeout';

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
