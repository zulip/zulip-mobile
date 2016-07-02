import {
  LOGIN_ATTEMPTED,
  LOGIN_SUCCEEDED,
  LOGIN_FAILED,

  DEV_EMAILS_FETCHING,
  DEV_EMAILS_FETCHED,
  DEV_EMAILS_FAILED,
} from './loginActions';

// Initial state
const initialState = {
  realm: 'http://localhost:9991',
  loggedIn: false,
  pendingLogin: false,
  dev: {
    directUsers: [],
    directAdmins: [],
  },
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    // Actions for the DevAuthBackend
    case DEV_EMAILS_FETCHING:
      return state;
    case DEV_EMAILS_FETCHED:
      return {
        ...state,
        dev: {
          ...state.dev,
          directUsers: action.directUsers,
          directAdmins: action.directAdmins,
        },
      };
    case DEV_EMAILS_FAILED:
      return state;

    case LOGIN_ATTEMPTED:
      return {
        ...state,
        loggedIn: false,
        pendingLogin: true,
      };
    case LOGIN_SUCCEEDED:
      return {
        ...state,
        loggedIn: true,
        pendingLogin: false,
        email: action.email,
        apiKey: action.apiKey,
      };
    case LOGIN_FAILED:
      return {
        ...state,
        loggedIn: false,
        pendingLogin: false,
      };
    default:
      return state;
  }
};

export default reducer;
