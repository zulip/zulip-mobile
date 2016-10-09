const statusOrder = (status) =>
  (!status ? 4 : ({
    active: 1,
    idle: 2,
    offline: 3,
  })[status]);

export const sortUserList = (users: any[]): any[] =>
  users.sort((x1, x2) =>
    statusOrder(x1.get('status')) - statusOrder(x2.get('status')) ||
    x1.get('fullName').toLowerCase().localeCompare(x2.get('fullName').toLowerCase())
  );

export const filterUserList = (users: any[], filter: string = '', ownEmail: string): any[] =>
  users.filter(x =>
    x.get('email') !== ownEmail &&
    (filter === '' ||
    x.get('fullName').toLowerCase().includes(filter.toLowerCase()) ||
    x.get('email').toLowerCase().includes(filter.toLowerCase()))
  );
