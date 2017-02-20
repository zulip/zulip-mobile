export const timeout = (func, onTimeout = () => {}, timeoutMs = 10000) =>
  Promise.race([
    func,
    typeof timeoutMs === 'number' &&
      new Promise(resolve => setTimeout(resolve, timeoutMs)).then(onTimeout)
  ]);

export const tryUntilSuccessful = async (func, maxRetries = 1000, timeoutMs = 1000) => {
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
