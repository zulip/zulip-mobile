
const initialState = {
  filter: '',
  users: [
    { status: 'active', name: 'Boris' },
    { status: 'idle', name: 'Tim' },
    { status: 'offline', name: 'Neraj' },
  ],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default reducer;
