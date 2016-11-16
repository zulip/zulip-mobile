const statusOrder = (status) => {
  switch (status) {
    case 'active': return 1;
    case 'idle': return 2;
    case 'offline': return 3;
    default: return 4;
  }
};

export const groupUsersByInitials = (users: any[]): any[] =>
  users.reduce((acc, x) => {
    if (acc[x.fullName[0]]) {
      acc[x.fullName[0]].push(x);
    } else {
      acc[x.fullName[0]] = []; // eslint-disable-line
    }
    return acc;
  }, {});

export const sortUserList = (users: any[]): any[] =>
  users.sort((x1, x2) =>
    statusOrder(x1.get('status')) - statusOrder(x2.get('status')) ||
    x1.get('fullName').toLowerCase().localeCompare(x2.get('fullName').toLowerCase())
  );

export const filterUsersStartingWith = (users: any[], filter: string = '', ownEmail: string): any[] =>
  users.filter(user =>
    user.get('email') !== ownEmail &&
    user.get('fullName').toLowerCase().startsWith(filter.toLowerCase())
  );

export const filterUserList = (users: any[], filter: string = '', ownEmail: string): any[] =>
  users.filter(user =>
    user.get('email') !== ownEmail &&
    (filter === '' ||
    user.get('fullName').toLowerCase().includes(filter.toLowerCase()) ||
    user.get('email').toLowerCase().includes(filter.toLowerCase()))
  );
