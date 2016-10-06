const statusOrder = {
  active: 1,
  idle: 2,
  offline: 3,
};

export const sortUserList = (users: any[]): any[] =>
  users.sort((x1, x2) =>
    statusOrder[x1.get('status')] - statusOrder[x2.get('status')] ||
    x1.get('fullName').localeCompare(x2.get('fullName'))
  );

export const filterUserList = (users: any[], filter: string = ''): any[] =>
  users.filter(x =>
    filter === '' ||
    x.get('fullName').toLowerCase().includes(filter.toLowerCase()) ||
    x.get('email').toLowerCase().includes(filter.toLowerCase())
  );
