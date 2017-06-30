/* @flow */
import { INIT_ROUTES, PUSH_ROUTE, POP_ROUTE } from '../actionConstants';

export const initRoutes = (routes: string[]) => ({
  type: INIT_ROUTES,
  routes,
});

export const pushRoute = (route: Object, data: Object) => ({
  type: PUSH_ROUTE,
  route,
  data,
});

export const popRoute = () => ({
  type: POP_ROUTE,
});
