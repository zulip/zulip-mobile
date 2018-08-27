function createTransform(inbound, outbound, config = {}) {
  const whitelist = config.whitelist || null;
  const blacklist = config.blacklist || null;

  function whitelistBlacklistCheck(key) {
    if (whitelist && whitelist.indexOf(key) === -1) {
      return true;
    }
    if (blacklist && blacklist.indexOf(key) !== -1) {
      return true;
    }
    return false;
  }

  return {
    in: (state, key) => (!whitelistBlacklistCheck(key) && inbound ? inbound(state, key) : state),
    out: (state, key) => (!whitelistBlacklistCheck(key) && outbound ? outbound(state, key) : state),
  };
}

export default createTransform;
