import Realm from 'realm';

export const getInitialRoutes = (accounts: any[]): string => {
  const activeAccount = accounts[0];

  if (activeAccount && activeAccount.apiKey) {
    return ['main'];
  }

  if (accounts.length > 1) return ['account'];
  if (checkFirstLaunch() ==  true) return ['tutorial'];
  return ['realm'];
};

export const getCurrentRoute = (state) =>
  state.nav.routes[state.nav.index];

checkFirstLaunch = () => {
	let repo = new Realm({
		schema: [{
			name: 'FirstLaunch',
			primaryKey: 'id',
			properties: {
				id: 'int',
				value: {type: 'bool'},
			}
		}]
	});
	const firstLaunch = repo.objectForPrimaryKey('FirstLaunch', 1);
	if(firstLaunch === undefined){
		repo.write(() => {
			repo.create('FirstLaunch', { id: 1, value: true, });
  		});
  	return true;
  } else {
  	return false;
  }
};
