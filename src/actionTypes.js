/* @flow */
import {
  REHYDRATE,
  APP_ONLINE,
  APP_STATE,
  APP_REFRESH,
  INIT_SAFE_AREA_INSETS,
  APP_ORIENTATION,
  START_EDIT_MESSAGE,
  CANCEL_EDIT_MESSAGE,
  DEBUG_FLAG_TOGGLE,
  ACCOUNT_SWITCH,
  REALM_ADD,
  ACCOUNT_REMOVE,
  LOGIN_SUCCESS,
  LOGOUT,
  REALM_INIT,
  DELETE_TOKEN_PUSH,
  SAVE_TOKEN_PUSH,
  MESSAGE_FETCH_START,
  MESSAGE_FETCH_COMPLETE,
  MARK_MESSAGES_READ,
  INITIAL_FETCH_START,
  INITIAL_FETCH_COMPLETE,
  INIT_REALM_EMOJI,
  INIT_REALM_FILTER,
  SETTINGS_CHANGE,
  DRAFT_ADD,
  DRAFT_REMOVE,
  SWITCH_NARROW,
  PRESENCE_RESPONSE,
  MESSAGE_SEND_START,
  MESSAGE_SEND_COMPLETE,
  DELETE_OUTBOX_MESSAGE,
  TOGGLE_OUTBOX_SENDING,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
  EVENT_STREAM_ADD,
  EVENT_STREAM_REMOVE,
  EVENT_STREAM_UPDATE,
  EVENT_STREAM_OCCUPY,
  EVENT_SUBSCRIPTION_ADD,
  EVENT_SUBSCRIPTION_REMOVE,
  EVENT_SUBSCRIPTION_UPDATE,
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  CLEAR_TYPING,
  INIT_STREAMS,
  INIT_TOPICS,
  INIT_SUBSCRIPTIONS,
  INIT_USERS,
} from './actionConstants';

import type {
  Dimensions,
  Orientation,
  GetState,
  GlobalState,
  Message,
  Outbox,
  Narrow,
  ApiServerSettings,
  User,
  UserGroup,
  InitialData,
  RealmFilter,
  Stream,
  Subscription,
  Topic,
  PresenceState,
  RealmEmojiState,
} from './types';

export type RehydrateAction = {
  type: typeof REHYDRATE,
  payload: GlobalState,
  error: ?Object,
};

export type AsyncActionCreator<A> = (dispatch: Dispatch, getState: GetState) => A;

export type AppOnlineAction = {
  type: typeof APP_ONLINE,
  isOnline: boolean,
};

export type AppOnlineActionCreator = (isOnline: boolean) => AsyncActionCreator<AppOnlineAction>;

export type AppStateAction = {
  type: typeof APP_STATE,
  isActive: boolean,
};

export type AppStateActionCreator = (isActive: boolean) => AppStateAction;

export type AppRefreshAction = {
  type: typeof APP_REFRESH,
};

export type AppRefreshActionCreator = (isActive: boolean) => AppRefreshAction;

export type InitSafeAreaInsetsAction = {
  type: typeof INIT_SAFE_AREA_INSETS,
  safeAreaInsets: Dimensions,
};

export type InitSafeAreaInsetsActionCreator = (
  safeAreaInsets: Dimensions,
) => InitSafeAreaInsetsAction;

export type AppOrientationAction = {
  type: typeof APP_ORIENTATION,
  orientation: Orientation,
};

export type AppOrientationActionCreator = (orientation: Orientation) => AppOrientationAction;

export type StartEditMessageAction = {
  type: typeof START_EDIT_MESSAGE,
  messageId: number,
  message: string,
  topic: string,
};

export type StartEditMessageActionCreator = (
  messageId: number,
  topic: string,
) => StartEditMessageAction;

export type CancelEditMessageAction = {
  type: typeof CANCEL_EDIT_MESSAGE,
};

export type CancelEditMessageActionCreator = () => CancelEditMessageAction;

export type DebugFlagToggleAction = {
  type: typeof DEBUG_FLAG_TOGGLE,
  key: string,
  value: string,
};

export type DebugFlagToggleActionCreator = (key: string, value: any) => DebugFlagToggleAction;

export type NavigateAction = Object;
export type NavigateActionCreator = () => NavigateAction;
export type NavigateToChatActionCreator = (narrow: Narrow) => NavigateAction;
export type NavigateToAuthActionCreator = (serverSettings: ApiServerSettings) => NavigateAction;
export type NavigateToPasswordActionCreator = (ldap?: boolean) => NavigateAction;
export type NavigateToAccountDetailsActionCreator = (email: string) => NavigateAction;
export type NavigateToGroupDetailsActionCreator = (recipients: string[]) => NavigateAction;
export type NavigateToAddNewAccountActionCreator = (realm: string) => NavigateAction;
export type NavigateToLightboxActionCreator = (src: string, message: Message) => NavigateAction;
export type NavigateToStreamActionCreator = (streamId: number) => NavigateAction;

export type AccountSwitchAction = {
  type: typeof ACCOUNT_SWITCH,
  index: number,
};

export type AccountSwitchActionCreator = (index: number) => AccountSwitchAction;

export type RealmAddAction = {
  type: typeof REALM_ADD,
  realm: string,
};

export type RealmAddActionCreator = (realm: string) => RealmAddAction;

export type AccountRemoveAction = {
  type: typeof ACCOUNT_REMOVE,
  index: number,
};

export type AccountRemoveActionCreator = (index: number) => AccountRemoveAction;

export type LoginSuccessAction = {
  type: typeof LOGIN_SUCCESS,
  realm: string,
  email: string,
  apiKey: string,
};

export type LoginSuccessActionCreator = (
  realm: string,
  email: string,
  apiKey: string,
) => LoginSuccessAction;

export type LogoutAction = {
  type: typeof LOGOUT,
};

export type LogoutActionCreator = () => LogoutAction;

export type RealmInitAction = {
  type: typeof REALM_INIT,
  data: InitialData,
};

export type RealmInitActionCreator = (data: InitialData) => RealmInitAction;

export type DeleteTokenPushAction = {
  type: typeof DELETE_TOKEN_PUSH,
};

export type DeleteTokenPushActionCreator = () => DeleteTokenPushAction;

export type SaveTokenPushAction = {
  type: typeof SAVE_TOKEN_PUSH,
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

export type MessageFetchStartAction = {
  type: typeof MESSAGE_FETCH_START,
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
  type: typeof MESSAGE_FETCH_COMPLETE,
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
  type: typeof MARK_MESSAGES_READ,
  messageIds: number[],
};

export type MarkMessagesReadActionCreator = (messageIds: number[]) => MarkMessagesReadAction;

export type FetchOlderActionCreator = (narrow: Narrow) => FetchMessagesAction;
export type FetchNewerActionCreator = (narrow: Narrow) => FetchMessagesAction;

export type InitialFetchStartAction = {
  type: typeof INITIAL_FETCH_START,
};
export type InitialFetchStartActionCreator = () => InitialFetchStartAction;

export type InitialFetchCompleteAction = {
  type: typeof INITIAL_FETCH_COMPLETE,
};

export type InitialFetchCompleteActionCreator = () => InitialFetchCompleteAction;

export type FetchEssentialInitialDataActionCreator = () => void;

export type FetchRestOfInitialDataActionCreator = () => void;

export type DoInitialFetchActionCreator = () => void;

export type UploadImageActionCreator = (narrow: Narrow, uri: string, name: string) => void;

export type StreamUpdateDetails = {
  description: string,
  history_public_to_subscribers: boolean,
  invite_only: boolean,
  is_announcement_only: boolean,
  name: string,
  stream_id: number,
};

export type EventAlertWordsAction = any;
export type EventRealmFiltersAction = any;
export type EventUpdateGlobalNotificationsSettingsAction = any;

export type EventSubscriptionAddAction = {
  type: typeof EVENT_SUBSCRIPTION_ADD,
  op: 'add',
  subscriptions: Subscription[],
  user: User,
};

export type EventSubscriptionRemoveAction = {
  type: typeof EVENT_SUBSCRIPTION_REMOVE,
  op: 'remove',
  subscriptions: Array<{
    name: string,
    stream_id: number,
  }>,
  user: User,
};

export type EventSubscriptionUpdateAction = {
  type: typeof EVENT_SUBSCRIPTION_UPDATE,
  op: 'update',
  email: string,
  name: string,
  property: string,
  stream_id: number,
  user: User,
  value: boolean | number | string,
};

export type EventSubscriptionPeerAddAction = any;
export type EventSubscriptionPeerRemoveAction = any;

export type EventStreamAddAction = {
  type: typeof EVENT_STREAM_ADD,
  op: 'create',
  streams: StreamUpdateDetails[],
};

export type EventStreamRemoveAction = {
  type: typeof EVENT_STREAM_REMOVE,
  op: 'delete',
  streams: StreamUpdateDetails[],
};

export type EventStreamUpdateAction = {
  type: typeof EVENT_STREAM_UPDATE,
  op: 'update',
  name: string,
  property: string,
  stream_id: number,
  value: string,
};

export type EventStreamOccupyAction = {
  type: typeof EVENT_STREAM_OCCUPY,
  op: 'occupy',
  streams: StreamUpdateDetails[],
};

export type EventNewMessageAction = any;
export type EventMessageDeleteAction = any;
export type EventUpdateMessageAction = any;
export type EventReactionAddAction = any;
export type EventReactionRemoveAction = any;
export type EventPresenceAction = any;
export type EventTypingStartAction = any;
export type EventTypingStopAction = any;
export type EventUpdateMessageFlagsAction = any;
export type EventUserAddAction = any;
export type EventUserRemoveAction = any;
export type EventUserUpdateAction = any;
export type EventMutedTopicsAction = any;
export type EventUserGroupAddAction = {
  type: typeof EVENT_USER_GROUP_ADD,
  op: 'add',
  id: number,
  group: UserGroup,
};
export type EventUserGroupRemoveAction = {
  type: typeof EVENT_USER_GROUP_REMOVE,
  op: 'remove',
  id: number,
  group_id: number,
};
export type EventUserGroupUpdateAction = {
  type: typeof EVENT_USER_GROUP_UPDATE,
  op: 'update',
  group_id: number,
  id: number,
  data: { description?: string, name?: string },
};
export type EventUserGroupAddMembersAction = {
  type: typeof EVENT_USER_GROUP_ADD_MEMBERS,
  op: 'add_members',
  group_id: number,
  id: number,
  user_ids: number[],
};
export type EventUserGroupRemoveMembersAction = {
  type: typeof EVENT_USER_GROUP_REMOVE_MEMBERS,
  op: 'remove_members',
  group_id: number,
  id: number,
  user_ids: number[],
};
export type EventRealmEmojiUpdateAction = any;
export type EventRealmFilterUpdateAction = any;
export type EventUpdateDisplaySettingsAction = any;

export type EventSubscriptionAction =
  | EventSubscriptionAddAction
  | EventSubscriptionRemoveAction
  | EventSubscriptionUpdateAction
  | EventSubscriptionPeerAddAction
  | EventSubscriptionPeerRemoveAction;

export type EventStreamAction =
  | EventStreamAddAction
  | EventStreamRemoveAction
  | EventStreamUpdateAction
  | EventStreamOccupyAction;

export type EventUserAction = EventUserAddAction | EventUserRemoveAction | EventUserUpdateAction;

export type EventUserGroupAction =
  | EventUserGroupAddAction
  | EventUserGroupRemoveAction
  | EventUserGroupUpdateAction
  | EventUserGroupAddMembersAction
  | EventUserGroupRemoveMembersAction;

export type EventReactionAction = EventReactionAddAction | EventReactionRemoveAction;

export type EventTypingAction = EventTypingStartAction | EventTypingStopAction;

export type EventAction = EventSubscriptionAction | EventUserAction;

export type InitRealmEmojiAction = {
  type: typeof INIT_REALM_EMOJI,
  emojis: RealmEmojiState,
};

export type InitRealmEmojiActionCreator = (emojis: Object) => InitRealmEmojiAction;

export type InitRealmFilterAction = {
  type: typeof INIT_REALM_FILTER,
  filters: RealmFilter[],
};

export type InitRealmFiltersActionCreator = (filters: RealmFilter[]) => InitRealmFilterAction;

export type RealmAction =
  | AppRefreshAction
  | RealmInitAction
  | DeleteTokenPushAction
  | SaveTokenPushAction
  | LoginSuccessAction
  | LogoutAction
  | InitRealmEmojiAction
  | InitRealmFilterAction
  | EventRealmFilterUpdateAction
  | EventRealmEmojiUpdateAction;

export type AlertWordsAction = RealmInitAction | EventAlertWordsAction;

export type ResponseToActionsActionCreator = (
  state: GlobalState,
  response: Object,
) => EventAction[];

export type FlagsAction =
  | RehydrateAction
  | MessageFetchCompleteAction
  | EventNewMessageAction
  | EventUpdateMessageFlagsAction
  | MarkMessagesReadAction;

export type DispatchOrBatchActionCreator = (dispatch: Dispatch, actions: EventAction[]) => void;
export type StartEventPollingActionCreator = (queueId: number, eventId: number) => void;

export type SettingsChangeAction = {
  type: typeof SETTINGS_CHANGE,
  key: string,
  value: any,
};

export type SettingsChangeActionCreator = (key: string, value: any) => SettingsChangeAction;

export type DraftAddAction = {
  type: typeof DRAFT_ADD,
  narrow: Narrow,
  content: string,
};

export type DraftAddActionCreator = (narrow: Narrow, content: string) => DraftAddAction;

export type DraftRemoveAction = {
  type: typeof DRAFT_REMOVE,
  narrow: Narrow,
};

export type DraftRemoveActionCreator = (narrow: Narrow) => DraftRemoveAction;

export type DraftsAction = DraftAddAction | DraftRemoveAction | LogoutAction;

export type SwitchNarrowAction = {
  type: typeof SWITCH_NARROW,
  narrow: Narrow,
};

export type SwitchNarrowActionCreator = (narrow: Narrow) => SwitchNarrowAction;

export type DoNarrowActionCreator = (narrow: Narrow, anchor?: number) => void;
export type MessageLinkPressActionCreator = (href: string) => void;

export type PresenceResponseAction = {
  type: typeof PRESENCE_RESPONSE,
  presence: PresenceState,
  serverTimestamp: number,
};

export type PresenceAction = EventPresenceAction | PresenceResponseAction | RealmInitAction;

export type MessageSendStartAction = {
  type: typeof MESSAGE_SEND_START,
  outbox: Outbox,
};

export type MessageSendStartActionCreator = (params: Object) => MessageSendStartAction;

export type MessageSendCompleteAction = {
  type: typeof MESSAGE_SEND_COMPLETE,
  localMessageId: number,
};

export type MessageSendCompleteActionCreator = (
  localMessageId: number,
) => MessageSendCompleteAction;

export type TrySendMessagesActionCreator = () => void;

export type AddToOutboxActionCreator = (narrow: Narrow, content: string) => void;

export type DeleteOutboxMessageAction = {
  type: typeof DELETE_OUTBOX_MESSAGE,
  localMessageId: number,
};

export type DeleteOutboxMessageActionCreator = (
  localMessageId: number,
) => DeleteOutboxMessageAction;

export type ToggleOutboxSendingAction = {
  type: typeof TOGGLE_OUTBOX_SENDING,
  sending: boolean,
};

export type ToggleOutboxSendingActionCreator = (sending: boolean) => ToggleOutboxSendingAction;

export type StartTypingAction = {
  type: typeof EVENT_TYPING_START,
  time: number,
  ownEmail: string,
  sender: { email: string, user_id: number },
  recipients: Object[],
};

export type StopTypingAction = {
  type: typeof EVENT_TYPING_STOP,
  time: number,
  ownEmail: string,
  sender: { email: string, user_id: number },
  recipients: Object[],
};

export type ClearTypingAction = {
  type: typeof CLEAR_TYPING,
  outdatedNotifications: string[],
};

export type ClearTypingActionCreator = (outdatedNotifications: Object[]) => ClearTypingAction;

export type TypingAction = StartTypingAction | StopTypingAction | ClearTypingAction;

export type InitStreamsAction = {
  type: typeof INIT_STREAMS,
  streams: Stream[],
};

export type InitStreamsActionCreator = (streams: Stream[]) => InitStreamsAction;

export type FetchStreamsActionCreator = () => void;

export type CreateNewStreamActionCreator = (
  name: string,
  description: string,
  principals: string[],
  isPrivate: boolean,
) => void;

export type UpdateExistingStreamActionCreator = (
  id: number,
  initialValues: Object,
  newValues: Object,
) => void;

export type DoTogglePinStreamActionCreator = (streamId: number, value: boolean) => void;

export type DoToggleMuteStreamActionCreator = (streamId: number, value: boolean) => void;

export type InitTopicsAction = {
  type: typeof INIT_TOPICS,
  topics: Topic[],
  streamId: number,
};

export type InitTopicsActionCreator = (outdatedNotifications: Object[]) => ClearTypingAction;

export type FetchTopicsActionCreator = (streamId: number) => void;

export type FetchTopicsForActiveStreamActionCreator = (narrow: Narrow) => void;

export type TopicsAction = InitTopicsAction | AccountSwitchAction;

export type InitSubscriptionsAction = {
  type: typeof INIT_SUBSCRIPTIONS,
  subscriptions: Subscription[],
};

export type InitSubscriptionsActionCreator = (
  subscriptions: Subscription[],
) => InitSubscriptionsAction;

export type FetchSubscriptionsActionCreator = () => void;
export type ToggleStreamNotificationActionCreator = (streamId: number, value: boolean) => void;

export type SendFocusPingActionCreator = (hasFocus?: boolean, newUserInput?: boolean) => void;

export type InitUsersAction = {
  type: typeof INIT_USERS,
  users: User[],
};

export type InitUsersActionCreator = (users: User[]) => InitUsersAction;

export type FetchUsersActionCreator = () => void;

export type SendTypingEventActionCreator = (narrow: Narrow) => void;

export type AccountAction =
  | AccountSwitchAction
  | RealmAddAction
  | AccountRemoveAction
  | LoginSuccessAction
  | LogoutAction;

export type CaughtUpAction =
  | AppRefreshAction
  | LogoutAction
  | LoginSuccessAction
  | AccountSwitchAction
  | MessageFetchCompleteAction;

export type LoadingAction =
  | AppRefreshAction
  | AccountSwitchAction
  | InitialFetchStartAction
  | InitialFetchCompleteAction
  | InitUsersAction
  | InitStreamsAction
  | InitSubscriptionsAction;

export type MessageAction =
  | MessageFetchCompleteAction
  | EventReactionAddAction
  | EventReactionRemoveAction
  | EventNewMessageAction
  | EventMessageDeleteAction
  | EventUpdateMessageAction;

export type MuteAction =
  | AppRefreshAction
  | AccountSwitchAction
  | RealmInitAction
  | EventMutedTopicsAction;

export type NavAction =
  | RehydrateAction
  | AccountSwitchAction
  | LoginSuccessAction
  | InitialFetchCompleteAction
  | LogoutAction
  | SwitchNarrowAction;

export type OutboxAction =
  | MessageSendStartAction
  | MessageSendCompleteAction
  | DeleteOutboxMessageAction;

export type SessionAction =
  | RehydrateAction
  | AppStateAction
  | AppOnlineAction
  | AppRefreshAction
  | InitSafeAreaInsetsAction
  | AppOrientationAction
  | StartEditMessageAction
  | CancelEditMessageAction
  | DebugFlagToggleAction
  | RealmInitAction
  | AccountSwitchAction
  | LoginSuccessAction
  | ToggleOutboxSendingAction
  | InitialFetchCompleteAction;

export type SettingsAction =
  | RealmInitAction
  | SettingsChangeAction
  | EventUpdateGlobalNotificationsSettingsAction;

export type StreamAction =
  | InitStreamsAction
  | EventStreamRemoveAction
  | EventStreamUpdateAction
  | AccountSwitchAction;

export type SubscriptionsAction =
  | InitSubscriptionsAction
  | RealmInitAction
  | EventSubscriptionAddAction
  | EventSubscriptionRemoveAction
  | EventSubscriptionUpdateAction;

export type UnreadAction =
  | RealmInitAction
  | EventNewMessageAction
  | MarkMessagesReadAction
  | EventMessageDeleteAction
  | EventUpdateMessageFlagsAction;

export type UsersAction = InitUsersAction | RealmInitAction | EventUserAddAction;

export type UserGroupsAction =
  | RealmInitAction
  | AccountSwitchAction
  | LoginSuccessAction
  | LogoutAction;

export type Action =
  | AccountAction
  | CaughtUpAction
  | LoadingAction
  | MessageAction
  | MuteAction
  | NavAction
  | OutboxAction
  | SessionAction
  | SettingsAction
  | StreamAction
  | SubscriptionsAction
  | UnreadAction
  | UsersAction;

export type Actions = {
  // sessionActions
  appOnline: AppOnlineActionCreator,
  appState: AppStateActionCreator,
  appRefresh: AppRefreshActionCreator,
  appOrientation: AppOrientationActionCreator,
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
  navigateToWelcomeHelp: NavigateActionCreator,
  navigateToWelcomeScreen: NavigateActionCreator,

  // accountActions
  switchAccount: AccountSwitchActionCreator,
  realmAdd: RealmAddActionCreator,
  removeAccount: AccountRemoveActionCreator,
  loginSuccess: LoginSuccessActionCreator,
  logout: LogoutActionCreator,

  // draftsActions
  draftAdd: DraftAddActionCreator,
  draftRemove: DraftRemoveActionCreator,

  // eventsActions
  responseToActions: ResponseToActionsActionCreator,
  dispatchOrBatch: DispatchOrBatchActionCreator,
  startEventPolling: StartEventPollingActionCreator,

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
  fetchMessagesAtFirstUnread: FetchMessagesAtFirstUnreadActionCreator,
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
  messagesendComplete: MessageSendCompleteActionCreator,
  trySendMessages: TrySendMessagesActionCreator,
  addToOutbox: AddToOutboxActionCreator,
  deleteOutboxMessage: DeleteOutboxMessageActionCreator,
  toggleOutboxSending: ToggleOutboxSendingActionCreator,

  // realmActions
  initRealmEmoji: InitRealmEmojiActionCreator,
  initRealmFilters: InitRealmFiltersActionCreator,

  // settingsActions
  settingsChange: SettingsChangeActionCreator,

  // streamActions
  initStreams: InitStreamsActionCreator,
  fetchStreams: FetchStreamsActionCreator,
  createNewStream: CreateNewStreamActionCreator,
  updateExistingStream: UpdateExistingStreamActionCreator,
  doTogglePinStream: DoTogglePinStreamActionCreator,
  doToggleMuteStream: DoToggleMuteStreamActionCreator,

  // subscriptionsActions
  initSubscriptions: InitSubscriptionsActionCreator,
  fetchSubscriptions: FetchSubscriptionsActionCreator,
  toggleStreamNotification: ToggleStreamNotificationActionCreator,

  // topicsActions
  initTopics: InitTopicsActionCreator,
  fetchTopics: FetchTopicsActionCreator,
  fetchTopicsForActiveStream: FetchTopicsForActiveStreamActionCreator,

  // typingActions
  clearTyping: ClearTypingActionCreator,

  // usersActions
  sendFocusPing: SendFocusPingActionCreator,
  initUsers: InitUsersActionCreator,
  fetchUsers: FetchUsersActionCreator,
  sendTypingEvent: SendTypingEventActionCreator,
};
