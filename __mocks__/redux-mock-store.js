import configureMockStore from 'redux-mock-store'; // eslint-disable-line
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);

export default mockStore;
