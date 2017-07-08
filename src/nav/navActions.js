/* @flow */
import { Action } from '../types';
import { INIT_ROUTES, PUSH_ROUTE, POP_ROUTE } from '../actionConstants';

export const initRoutes = (routes: string[]): Action => ({
  type: INIT_ROUTES,
  routes,
});

export const pushRoute = (route: Object, data: Object): Action => ({
  type: PUSH_ROUTE,
  route,
  data,
});

export const popRoute = (): Action => ({
  type: POP_ROUTE,
});
