export const INIT_ROUTES = 'INIT_ROUTES';
export const PUSH_ROUTE = 'PUSH_ROUTE';
export const POP_ROUTE = 'POP_ROUTE';
export const CHANGE_TAB = 'CHANGE_TAB';

export const OPEN_STREAM_SIDEBAR = 'OPEN_STREAM_SIDEBAR';
export const CLOSE_STREAM_SIDEBAR = 'CLOSE_STREAM_SIDEBAR';

export const initRoutes = (routes: string[]) => ({
  type: INIT_ROUTES,
  routes,
});

export const pushRoute = (route: Object) => ({
  type: PUSH_ROUTE,
  route,
});

export const popRoute = () => ({
  type: POP_ROUTE,
});

export const changeTab = (index: number) => ({
  type: CHANGE_TAB,
  index,
});

export const openStreamSidebar = () => ({
  type: OPEN_STREAM_SIDEBAR,
});

export const closeStreamSidebar = () => ({
  type: CLOSE_STREAM_SIDEBAR,
});
