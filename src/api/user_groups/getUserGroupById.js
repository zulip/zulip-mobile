/* @flow strict-local */
import type { Auth } from '../transportTypes';
import { apiGet } from '../apiFetch';

export default (auth: Auth, id: number): Promise<mixed> => apiGet(auth, `realm/user_groups/${id}`);
