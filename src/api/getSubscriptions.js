import {apiGet} from './apiFetch';

export default async auth =>
  apiGet(auth, 'users/me/subscriptions', {}, res => res.subscriptions);
