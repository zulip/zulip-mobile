const statusOrder = (status) => {
  switch (status) {
    case 'active': return 1;
    case 'idle': return 2;
    case 'offline': return 3;
    default: return 4;
  }
};

export const groupUsersByInitials = (users: any[]): any[] =>
  users.reduce((accounts, x) => {
    const firstLetter = x.fullName[0].toUpperCase();
    if (!accounts[firstLetter]) {
      accounts[firstLetter] = []; // eslint-disable-line
    }
    accounts[firstLetter].push(x);
    return accounts;
  }, {});

export const sortUserList = (users: any[]): any[] =>
  users.sort((x1, x2) =>
    statusOrder(x1.status) - statusOrder(x2.status) ||
    x1.fullName.toLowerCase().localeCompare(x2.fullName.toLowerCase())
  );

export const filterUsersStartingWith = (users: any[], filter: string = '', ownEmail: string): any[] =>
  users.filter(user =>
    user.email !== ownEmail &&
    user.fullName.toLowerCase().startsWith(filter.toLowerCase())
  );

export const filterUserList = (users: any[], filter: string = '', ownEmail: string): any[] =>
  users.filter(user =>
    user.email !== ownEmail &&
    (filter === '' ||
    user.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase()))
  );
