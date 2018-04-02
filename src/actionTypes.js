/* @flow */
import type {
  Dimensions,
  GetState,
  Message,
  Narrow,
  ServerSettings,
  User,
  InitialRealmData,
} from './types';

export type AsyncActionCreator<A> = (dispatch: Dispatch, getState: GetState) => A;

export type AppOnlineAction = {
  type: 'APP_ONLINE',
  isOnline: boolean,
};

export type AppOnlineActionCreator = (isOnline: boolean) => AsyncActionCreator<AppOnlineAction>;

export type AppStateAction = {
  type: 'APP_STATE',
  isActive: boolean,
};

export type AppStateActionCreator = (isActive: boolean) => AppStateAction;

export type AppRefreshAction = {
  type: 'APP_REFRESH',
};

export type AppRefreshActionCreator = (isActive: boolean) => AppRefreshAction;

export type InitSafeAreaInsetsAction = {
  type: 'INIT_SAFE_AREA_INSETS',
  ...Dimensions,
};

export type InitSafeAreaInsetsActionCreator = (
  safeAreaInsets: Dimensions,
) => InitSafeAreaInsetsAction;

export type AppOrientationAction = {
  type: 'APP_ORIENTATION',
  orientation: string,
};

export type AppOrientationActionCreator = (orientation: string) => AppOrientationAction;

export type StartEditMessageAction = {
  type: 'START_EDIT_MESSAGE',
  messageId: number,
  message: Message,
  topic: string,
};

export type StartEditMessageActionCreator = (
  messageId: number,
  topic: string,
) => StartEditMessageAction;

export type CancelEditMessageAction = {
  type: 'CANCEL_EDIT_MESSAGE',
};

export type CancelEditMessageActionCreator = (isActive: boolean) => CancelEditMessageAction;

export type DebugFlagToggleAction = {
  type: 'DEBUG_FLAG_TOGGLE',
  key: string,
  value: string,
};

export type DebugFlagToggleActionCreator = (key: string, value: any) => DebugFlagToggleAction;

export type NavigateAction = Object;
export type NavigateActionCreator = () => NavigateAction;
export type NavigateToChatActionCreator = (narrow: Narrow) => NavigateAction;
export type NavigateToAuthActionCreator = (serverSettings: ServerSettings) => NavigateAction;
export type NavigateToPasswordActionCreator = (ldap: boolean) => NavigateAction;
export type NavigateToAccountDetailsActionCreator = (email: string) => NavigateAction;
export type NavigateToGroupDetails = (recipients: User[]) => NavigateAction;
export type NavigateToAddNewAccountActionCreator = (realm: string) => NavigateAction;
export type NavigateToLightboxActionCreator = (src: string, message: Message) => NavigateAction;
export type NavigateToStreamActionCreator = (streamId: number) => NavigateAction;

export type AccountSwitchAction = {
  type: 'ACCOUNT_SWITCH',
  index: number,
};

export type AccountSwitchActionCreator = (index: number) => AccountSwitchAction;

export type RealmAddAction = {
  type: 'REALM_ADD',
  realm: string,
};

export type RealmAddActionCreator = (realm: string) => RealmAddAction;

export type AccountRemoveAction = {
  type: 'ACCOUNT_REMOVE',
  index: number,
};

export type AccountRemoveActionCreator = (index: number) => AccountRemoveAction;

export type LoginSuccessAction = {
  type: 'LOGIN_SUCCESS',
  realm: string,
  email: string,
  apiKey: string,
};

export type LoginSuccessActionCreator = (index: number) => LoginSuccessAction;

export type LogoutAction = {
  type: 'LOGOUT',
};

export type LogoutActionCreator = (index: number) => LogoutAction;

export type AccountAction =
  | AccountSwitchAction
  | RealmAddAction
  | AccountRemoveAction
  | LoginSuccessAction
  | LogoutAction;

export type RealmInitAction = {
  type: 'REALM_INIT',
  data: InitialRealmData,
};

export type RealmInitActionCreator = (data: InitialRealmData) => RealmInitAction;

export type DeleteTokenPushAction = {
  type: 'DELETE_TOKEN_PUSH',
};

export type DeleteTokenPushActionCreator = () => DeleteTokenPushAction;

export type SaveTokenPushAction = {
  type: 'SAVE_TOKEN_PUSH',
  pushToken: string,
  result: string,
  msg: string,
};

export type SaveTokenPushActionCreator = (
  pushToken: string,
  result: string,
  msg: string,
) => SaveTokenPushAction;

export type InitNotificationsActionCreator = () => void;

export type RealmAction = RealmInitAction | DeleteTokenPushAction | SaveTokenPushAction;

export type Action = any;
/*  | AppOnlineAction
  | AppOnlineAction
  | AppRefreshAction
  | InitSafeAreaInsetsAction
  | AppOrientationAction
  | StartEditMessageAction
  | CancelEditMessageAction
  | DebugFlagToggleAction
  | NavigateAction
  | AccountSwitchAction
  | RealmAddAction
  | AccountRemoveAction
  | LoginSuccessAction
  | LogoutAction; */

export type Actions = any; /* {
  appOnline: AppOnlineActionCreator,
  appState: AppStateActionCreator,
  appRefresh: AppRefreshActionCreator,
  initSafeAreaInsets: InitSafeAreaInsetsActionCreator,
  startEditMessage: StartEditMessageActionCreator,
  cancelEditMessage: CancelEditMessageActionCreator,
  debugFlagToggle: DebugFlagToggleActionCreator,

  navigateBack: NavigateActionCreator,
  navigateToChat: NavigateToChatActionCreator,
  navigateToAllStreams: NavigateActionCreator,
  navigateToUsersScreen: NavigateActionCreator,
  navigateToSearch: NavigateActionCreator,
  navigateToSettings: NavigateActionCreator,
  navigateToAuth: NavigateToAuthActionCreator,
  navigateToDev: NavigateActionCreator,
  navigateToPassword: NavigateToPasswordActionCreator,
  navigateToAccountPicker: NavigateActionCreator,
  navigateToAccountDetails: NavigateToAccountDetailsActionCreator,
  navigateToGroupDetails: NavigateToGroupDetailsActionCreator,
  navigateToAddNewAccount: NavigateToAddNewAccountActionCreator,
  navigateToLightbox: NavigateToLightboxActionCreator,
  navigateToLoading: NavigateActionCreator,
  navigateToLanguage: NavigateActionCreator,
  navigateToCreateGroup: NavigateActionCreator,
  navigateToDiagnostics: NavigateActionCreator,
  navigateToVariables: NavigateActionCreator,
  navigateToTiming: NavigateActionCreator,
  navigateToStorage: NavigateActionCreator,
  navigateToDebug: NavigateActionCreator,
  navigateToNotifDiag: NavigateActionCreator,
  navigateToStream: NavigateToStreamActionCreator,
  navigateToTopicList: NavigateToStreamActionCreator,
  navigateToCreateStream: NavigateActionCreator,
  navigateToEditStream: NavigateToStreamActionCreator,
  navigateToNotifications: NavigateActionCreator,

  switchAccount: AccountSwitchActionCreator,
  realmAdd: RealmAddActionCreator
  removeAccount: AccountRemoveActionCreator,
  loginSuccess: LoginSuccessActionCreator,
  logout: LogoutActionCreator,

  realmInit: RealmInitActionCreator,
  deleteTokenPush: DeleteTokenPushActionCreator,
  saveTokenPush: SaveTokenPushActionCreator,
  initNotifications: InitNotificationsActionCreator,

  addToOutbox: (
    type: 'private' | 'stream',
    to: string | string[],
    subject: string,
    content: string,
  ) => Action,
  sessionState: (isActive: boolean) => Action,
  appOrientation: (orientation: string) => Action,
  sendFocusPing: (hasFocus: boolean, newUserInput: boolean) => Action,
  initUsers: (users: User[]) => Action,
  fetchUsers: () => Action,
  initialFetchComplete: () => Action,
  fetchEssentialInitialData: () => Action,
  fetchRestOfInitialData: (pushToken: string) => Action,
  deleteTokenPush: () => Action,
  deleteOutboxMessage: () => Action,
  saveTokenPush: (pushToken: string, result: string, msg: string) => Action,
  fetchEvents: () => Action,
  initNotifications: () => Action,
  switchAccount: (index: number) => Action,
  realmAdd: (realm: string) => Action,
  removeAccount: (index: number) => Action,
  loginSuccess: (realm: string, email: string, apiKey: string) => Action,
  logout: () => Action,
  initStreams: (streams: any[]) => Action,
  fetchStreams: () => Action,
  cancelEditMessage: () => void,
  startEditMessage: (messageId: number) => void,
  resetNavigation: () => Action,
  navigateBack: () => Action,
  navigateToAllStreams: () => Action,
  navigateToUsersScreen: () => Action,
  navigateToSearch: () => Action,
  navigateToSettings: () => Action,
  navigateToAuth: (serverSettings: ServerSettings) => Action,
  navigateToAccountPicker: () => Action,
  navigateToAccountDetails: (email: string) => Action,
  navigateToGroupDetails: (recipients: User) => Action,
  navigateToAddNewAccount: () => Action,
  navigateToLightbox: (realm: string) => Action,
  navigateToCreateGroup: () => Action,
  navigateToDiagnostics: () => Action,
  switchNarrow: (narrow: Narrow) => Action,
  doNarrow: (newNarrow: Narrow, anchor?: number) => Action,
  messageFetchStart: (narrow: Narrow, fetching: Object) => Action,
  messageFetchComplete: (
    messages: any[],
    narrow: Narrow,
    numBefore: number,
    numAfter: number,
  ) => Action,
  backgroundFetchMessages: (
    anchor: number,
    numBefore: number,
    numAfter: number,
    narrow: Narrow,
    useFirstUnread: boolean,
  ) => Action,
  fetchMessages: (
    anchor: number,
    numBefore: number,
    numAfter: number,
    narrow: Narrow,
    useFirstUnread: boolean,
  ) => Action,
  fetchMessagesAtFirstUnread: (narrow: Narrow) => Action,
  markMessagesRead: (messageIds: number[]) => Action,
  fetchOlder: () => Action,
  fetchNewer: () => Action,
}; */
