// if no previous accounts => go to server pick screen
//

export const getNextLoginRoute = (accounts: any[], activeAccount): string => {
  if (!activeAccount) {
    return accounts.size > 0 ? 'accountlist' : 'realm';
  // } else if (!activeAccount.realm) {
  } else if (!activeAccount.email) {
    return 'password';
  } else if (!activeAccount.todo) {
    return 'dev';
  } else {
    return 'unknown';
  }
};
