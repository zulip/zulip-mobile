/* @flow */
export const timeout = (
  func: any,
  onTimeout: Function = () => {},
  timeoutMs: number = 10000
): Promise<*> =>
  Promise.race([
    func,
    new Promise(resolve => setTimeout(resolve, timeoutMs)).then(onTimeout)
  ]);

export const tryUntilSuccessful = async (
  func: any,
  maxRetries: number = 1000,
  timeoutMs: number = 1000
) => {
  if (!maxRetries) {
    return func();
  }

  try {
    return await func();
  } catch (e) {
    await new Promise(resolve => setTimeout(resolve, timeoutMs));
  }
  return tryUntilSuccessful(func, maxRetries - 1, timeoutMs * 1.5);
};
