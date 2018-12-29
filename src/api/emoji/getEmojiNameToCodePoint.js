/* @flow strict-local */
import type { Auth } from '../apiTypes';
import { apiGet } from '../apiFetch';

export default async (auth: Auth): Promise<string[]> =>
  apiGet(auth, 'static/generated/emoji/name_to_codepoint.json', res => res, undefined, false, true);
