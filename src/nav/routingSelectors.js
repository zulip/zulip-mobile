export const getInitialRoutes = (accounts: any[]): string => {
  const activeAccount = accounts.get(0);

  if (activeAccount && activeAccount.get('apiKey')) {
    return ['main'];
  }

  const routeList = [];

  if (accounts.size > 1) routeList.push('account');

  routeList.push('realm');

  if (activeAccount) {
    if (activeAccount.get('email')) {
      routeList.push('password');
    } else if (activeAccount.get('todo')) {
      routeList.push('dev');
    } else if (activeAccount.get('todo2')) {
      routeList.push('google');
    }
  }

  return routeList;
};
