import {
  INIT_ROUTES,
  PUSH_ROUTE,
  POP_ROUTE,
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
