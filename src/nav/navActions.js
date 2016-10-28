import {
  INIT_ROUTES,
  PUSH_ROUTE,
  POP_ROUTE,
  OPEN_STREAM_SIDEBAR,
  CLOSE_STREAM_SIDEBAR,
} from '../constants';

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

export const openStreamSidebar = () => ({
  type: OPEN_STREAM_SIDEBAR,
});

export const closeStreamSidebar = () => ({
  type: CLOSE_STREAM_SIDEBAR,
});
