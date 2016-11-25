export const getInitialRoutes = (accounts: any[]): string => {
  const activeAccount = accounts[0];

  if (activeAccount && activeAccount.apiKey) {
    return ['main'];
  }

  const routeList = [];

  if (accounts.length > 1) routeList.push('account');

  routeList.push('realm');

  if (activeAccount) {
    if (activeAccount.email) {
      routeList.push('password');
    } else if (activeAccount.todo) {
      routeList.push('dev');
    } else if (activeAccount.todo2) {
      routeList.push('google');
    }
  }

  return routeList;
};
