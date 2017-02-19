export const timeout = (func, onTimeout = () => {}, timeoutMs = 10000) =>
  Promise.race([
    func,
    typeof timeoutMs === 'number' &&
      new Promise(resolve => setTimeout(resolve, timeoutMs)).then(onTimeout)
  ]);

export const tryUntilSuccessful2 = async (func, timeoutMs = 1000) => {
  try {
    console.log('return await func;');
    return await func;
  } catch (e) {
    console.log('await new Promise(resolve => setTimeout(resolve, timeoutMs));');
    await new Promise(resolve => setTimeout(resolve, timeoutMs));
  }
  console.log('return tryUntilSuccessful(func, timeoutMs * 1.5);');
  return tryUntilSuccessful(func, timeoutMs * 1.5);
};

export const tryUntilSuccessful = (func, maxRetries = 100000) => {
  let errThrown = false;
  return func
  .catch(err => {
    errThrown = true;
    if (maxRetries <= 0) {
      throw err;
    }
    console.log('catching exception');
  })
  .catch(new Promise(resolve => setTimeout(resolve, 1000)))
  .then(result => {
    console.log('result is ', result);
    if (errThrown) return tryUntilSuccessful(func, maxRetries - 1); else return result;
  });
};

// export const tryUntilSuccessful3 = async (func, timeoutMs = 1000) => {
//   for (let t = timeoutMs; true; t *= 1.5) {
//     try {
//       return await func;
//     } catch (e) {
//       // console.log('fail. retry in ', e, t);
//     }
//     await new Promise(resolve => setTimeout(resolve, t));
//     console.log('retrying');
//   }
// };
