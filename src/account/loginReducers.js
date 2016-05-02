import {
  LOGIN_ATTEMPTED,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,
} from './loginActions';

// Initial state
const initialState = {
  loggedIn: false,
  pendingLogin: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_ATTEMPTED:
      return {
        loggedIn: false,
        pendingLogin: true,
      };
    case LOGIN_SUCCEEDED:
      return {
        loggedIn: true,
        pendingLogin: false,
        apiKey: action.apiKey,
        apiClient: action.apiClient,
      };
    case LOGIN_FAILED:
      return {
        loggedIn: false,
        pendingLogin: false,
      };
    default:
      return state;
  }
};

export default reducer;
