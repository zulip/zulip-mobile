export default (func, onTimeout = () => {}, timeoutMs = 10000) =>
  Promise.race([
    func,
    typeof timeoutMs === 'number' &&
      new Promise(resolve => setTimeout(resolve, timeoutMs)).then(onTimeout)
  ]);
