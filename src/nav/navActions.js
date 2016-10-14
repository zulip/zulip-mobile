export const PUSH_ROUTE = 'PUSH_ROUTE';
export const POP_ROUTE = 'POP_ROUTE';
export const CHANGE_TAB = 'CHANGE_TAB';

export const OPEN_STREAM_SIDEBAR = 'OPEN_STREAM_SIDEBAR';
export const CLOSE_STREAM_SIDEBAR = 'CLOSE_STREAM_SIDEBAR';

export const push = (route) => ({
  type: PUSH_ROUTE,
  route,
});

export const pop = () => ({
  type: POP_ROUTE,
});

export const changeTab = (index) => ({
  type: CHANGE_TAB,
  index,
});

export const openStreamSidebar = () => ({
  type: OPEN_STREAM_SIDEBAR,
});

export const closeStreamSidebar = () => ({
  type: CLOSE_STREAM_SIDEBAR,
});
