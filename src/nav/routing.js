export const getNextLoginRoute = (accounts, activeAccount) => {
  if (!activeAccount) {
    return { key: 'realm', title: 'Realm' };
  } else if (accounts.size > 0) {
    return { key: 'accountlist', title: 'Account' };
  // } else if (!activeAccount.realm) {
  } else if (!activeAccount.email) {
    return { key: 'password', title: 'Password' };
  } else if (!activeAccount.todo) {
    return { key: 'dev', title: 'Dev' };
  } else {
    return { key: 'unknown', title: 'Unknown' };
  }
};
