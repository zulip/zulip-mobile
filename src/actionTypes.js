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

export type MessageFetchStartAction = {
  type: 'MESSAGE_FETCH_START',
  narrow: Narrow,
  numBefore: number,
  numAfter: number,
};

export type MessageFetchStartActionCreator = (
  narrow: Narrow,
  numBefore: number,
  numAfter: number,
) => MessageFetchStartAction;

export type MessageFetchCompleteAction = {
  type: 'MESSAGE_FETCH_COMPLETE',
  messages: Message[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
};

export type MessageFetchCompleteActionCreator = (
  messages: Message[],
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
) => void;

export type FetchMessagesAction = any;

export type FetchMessagesActionCreator = (
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean,
) => FetchMessagesAction;

export type FetchMessagesAroundAnchorActionCreator = (
  narrow: Narrow,
  anchor: number,
) => FetchMessagesAction;

export type FetchMessagesAtFirstUnreadActionCreator = (narrow: Narrow) => FetchMessagesAction;

export type BackgroundFetchMessagesActionCreator = (
  narrow: Narrow,
  anchor: number,
  numBefore: number,
  numAfter: number,
  useFirstUnread: boolean,
) => void;

export type MarkMessagesReadAction = {
  type: 'MARK_MESSAGES_READ',
  messageIds: number[],
};

export type MarkMessagesReadActionCreator = (messageIds: number[]) => MarkMessagesReadAction;

export type FetchOlderActionCreator = (narrow: Narrow) => FetchMessagesAction;
export type FetchNewerActionCreator = (narrow: Narrow) => FetchMessagesAction;

export type InitialFetchStartAction = {
  type: 'INITIAL_FETCH_START',
};

export type InitialFetchCompleteAction = {
  type: 'INITIAL_FETCH_COMPLETE',
};

export type FetchEssentialInitialDataActionCreator = () => void;

export type FetchRestOfInitialDataActionCreator = () => void;

export type DoInitialFetchActionCreator = () => void;

export type UploadImageActionCreator = (narrow: Narrow, uri: string, name: string) => void;

export type EventUpdateGlobalNotificationsSettingsAction = any;

export type SettingsChangeAction = {
  type: 'SETTINGS_CHANGE',
  key: string,
  value: any,
};

export type SettingsAction =
  | RealmInitAction
  | SettingsChangeAction
  | EventUpdateGlobalNotificationsSettingsAction;

export type DraftAddAction = {
  type: 'DRAFT_ADD',
  narrow: Narrow,
  content: string,
};

export type DraftAddActionCreator = (narrow: Narrow, content: string) => DraftAddAction;

export type DraftRemoveAction = {
  type: 'DRAFT_REMOVE',
  narrow: Narrow,
};

export type DraftDeleteActionCreator = (narrow: Narrow) => DraftRemoveAction;

export type DraftsAction = DraftAddAction | DraftRemoveAction | LogoutAction;

export type SwitchNarrowAction = {
  type: 'SWITCH_NARROW',
  narrow: Narrow,
};

export type SwitchNarrowActionCreator = (narrow: Narrow) => SwitchNarrowAction;

export type DoNarrowActionCreator = (narrow: Narrow, anchor: number) => void;
export type MessageLinkPressActionCreator = (href: string) => void;

export type EventReactionAddAction = any;
export type EventReactionRemoveAction = any;
export type EventNewMessageAction = any;
export type EventMessageDeleteAction = any;
export type EventUpdateMessageAction = any;

export type MessageAction =
  | MessageFetchCompleteAction
  | EventReactionAddAction
  | EventReactionRemoveAction
  | EventNewMessageAction
  | EventMessageDeleteAction
  | EventUpdateMessageAction;

export type MessageSendStartAction = {
  type: 'MESSAGE_SEND_START',
  params: Object,
};

export type MessageSendStartActionCreator = (params: Object) => MessageSendStartAction;

export type MessageSendCompleteAction = {
  type: 'MESSAGE_SEND_COMPLETE',
  localMessageId: number,
};

export type MessageSendCompleteActionCreator = (
  localMessageId: number,
) => MessageSendCompleteAction;

export type DeleteOutboxMessageAction = {
  type: 'DELETE_OUTBOX_MESSAGE',
  localMessageId: number,
};

export type DeleteOutboxMessageActionCreator = (
  localMessageId: number,
) => DeleteOutboxMessageAction;

export type OutboxAction =
  | MessageSendStartAction
  | MessageSendCompleteAction
  | DeleteOutboxMessageAction;

export type StartTypingAction = {
  type: 'EVENT_TYPING_START',
  time: number,
  ownEmail: string,
  sender: { email: string, user_id: number },
  recipients: Object[],
};

export type StopTypingAction = {
  type: 'EVENT_TYPING_STOP',
  time: number,
  ownEmail: string,
  sender: { email: string, user_id: number },
  recipients: Object[],
};

export type ClearTypingAction = {
  type: 'CLEAR_TYPING',
  outdatedNotifications: string[],
};

export type ClearTypingActionCreator = (outdatedNotifications: Object[]) => ClearTypingAction;

export type TypingAction = StartTypingAction | StopTypingAction | ClearTypingAction;

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
  // sessionActions
  appOnline: AppOnlineActionCreator,
  appState: AppStateActionCreator,
  appRefresh: AppRefreshActionCreator,
  initSafeAreaInsets: InitSafeAreaInsetsActionCreator,
  startEditMessage: StartEditMessageActionCreator,
  cancelEditMessage: CancelEditMessageActionCreator,
  debugFlagToggle: DebugFlagToggleActionCreator,

  // navActions
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

  // accountActions
  switchAccount: AccountSwitchActionCreator,
  realmAdd: RealmAddActionCreator
  removeAccount: AccountRemoveActionCreator,
  loginSuccess: LoginSuccessActionCreator,
  logout: LogoutActionCreator,

  // draftsActions
  draftAdd: DraftAddAction,
  draftDelete: DraftDeleteActionCreator,

  // realmActions
  realmInit: RealmInitActionCreator,
  deleteTokenPush: DeleteTokenPushActionCreator,
  saveTokenPush: SaveTokenPushActionCreator,
  initNotifications: InitNotificationsActionCreator,

  // fetchActions
  fetchMessages: FetchMessagesActionCreator,
  messageFetchStart: MessageFetchStartActionCreator,
  messageFetchComplete: MessageFetchCompleteActionCreator,
  fetchMessagesAroundAnchor: FetchMessagesAroundAnchorActionCreator,
  fetchMessagesAtFirstUnread: FetchMessagesAtFirstUnreadAcionCreator,
  backgroundFetchMessages: BackgroundFetchMessagesActionCreator,
  markMessagesRead: MarkMessagesReadActionCreator,
  fetchOlder: FetchOlderActionCreator,
  fetchNewer: FetchNewerActionCreator,
  initialFetchStart: InitialFetchStartActionCreator,
  initialFetchComplete: InitialFetchCompleteActionCreator,
  fetchEssentialInitialData: FetchEssentialInitialDataActionCreator,
  fetchRestOfInitialData: FetchRestOfInitialDataActionCreator,
  doInitialFetch: DoInitialFetchActionCreator,
  uploadImage: UploadImageActionCreator,

  // messageActions
  switchNarrow: SwitchNarrowActionCreator,
  doNarrow: DoNarrowActionCreator,
  messageLinkPress: MessageLinkPressActionCreator,

  // outboxActions
  messageSendStart: MessageSendStartActionCreator,

  // typingActions
  clearTyping: ClearTypingActionCreator,
}; */
