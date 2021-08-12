/* @flow strict-local */
import config from './config';

/**
 * Whether a URL is hosted by the same org that publishes the app.
 */
export default function isAppOwnDomain(url: URL): boolean {
  return config.appOwnDomains.some(
    domain => url.host === domain || url.host.endsWith(`.${domain}`),
  );
}
