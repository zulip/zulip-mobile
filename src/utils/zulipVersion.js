/* @flow strict-local */
/* eslint-disable no-underscore-dangle */

type VersionElements = {
  major: number | void,
  minor: number | void,
  patch: number | void,
  flag: 'dev' | ['rc', number] | void,
  numCommits: number | void,
  commitId: string | void,
};

/**
 * Parsed form of a Zulip server version.
 *
 * Used on a Zulip version received from the server with /server_settings
 * * to compare it to a threshold version where a feature was added on the
 *   server: use .isAtLeast
 * * to report it to Sentry: use .raw for its raw form, and .elements
 *   for the data needed to make other tags to help with event
 *   aggregation.
 *
 * The ZulipVersion instance itself cannot be persisted in ZulipAsyncStorage or
 * sent to Sentry because it isn't serializable. Instead, persist the raw
 * version string.
 */
export class ZulipVersion {
  _raw: string;
  _comparisonArray: number[];
  _elements: VersionElements;

  constructor(raw: string) {
    this._raw = raw;
    const elements = ZulipVersion._getElements(raw);
    this._comparisonArray = ZulipVersion._getComparisonArray(elements);
    this._elements = elements;
  }

  /**
   * The raw version string that was passed to the constructor.
   */
  raw = () => this._raw;

  /**
   * Data to be sent to Sentry to help with event aggregation.
   */
  elements = () => this._elements;

  /**
   * True if this version is later than or equal to a given threshold.
   */
  isAtLeast = (otherZulipVersion: string | ZulipVersion) => {
    const otherZulipVersionInstance =
      otherZulipVersion instanceof ZulipVersion
        ? otherZulipVersion
        : new ZulipVersion(otherZulipVersion);

    const otherComparisonArray = otherZulipVersionInstance._comparisonArray;
    const minLength = Math.min(this._comparisonArray.length, otherComparisonArray.length);
    for (let i = 0; i < minLength; i++) {
      if (this._comparisonArray[i] !== otherComparisonArray[i]) {
        // We found a difference; the greater number wins.
        return this._comparisonArray[i] > otherComparisonArray[i];
      }
    }
    // It's a tie so far, and one of the arrays has ended. The array with
    // further elements wins.
    return this._comparisonArray.length >= otherComparisonArray.length;
  };

  /**
   * Parse the raw string into a VersionElements.
   */
  static _getElements = (raw: string): VersionElements => {
    const result: VersionElements = {
      major: undefined,
      minor: undefined,
      patch: undefined,
      flag: undefined,
      numCommits: undefined,
      commitId: undefined,
    };

    let rest = raw;

    const numbersMatch = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(rest);
    if (numbersMatch === null) {
      return result;
    }
    result.major = parseInt(numbersMatch[1], 10);
    result.minor = numbersMatch[2] !== undefined ? parseInt(numbersMatch[2], 10) : undefined;
    result.patch = numbersMatch[3] !== undefined ? parseInt(numbersMatch[3], 10) : undefined;
    rest = rest.slice(numbersMatch[0].length);

    const flagMatch = /^-(?:(dev)|(?:(rc)(\d+)))/.exec(rest);
    if (flagMatch !== null) {
      if (flagMatch[1] === 'dev') {
        result.flag = 'dev';
      } else if (flagMatch[2] === 'rc') {
        result.flag = ['rc', parseInt(flagMatch[3], 10)];
      }
      rest = rest.slice(flagMatch[0].length);
    }

    // Look for a suffix from git-describe.
    const commitsMatch = /^-(\d+)-g([a-fA-F0-9]{4,40})/.exec(rest);
    if (commitsMatch !== null) {
      result.numCommits = parseInt(commitsMatch[1], 10);
      result.commitId = commitsMatch[2]; // eslint-disable-line prefer-destructuring
    }

    return result;
  };

  /**
   * Compute a number[] to be used in .isAtLeast comparisons.
   */
  static _getComparisonArray = (elements: VersionElements): number[] => {
    const { major, minor, patch, flag, numCommits } = elements;
    const result: number[] = [];

    // Push major, minor, and patch first, then trim trailing zeroes.
    if (major !== undefined) {
      result.push(major);
    }
    if (minor !== undefined) {
      result.push(minor);
    }
    if (patch !== undefined) {
      result.push(patch);
    }
    while (result[result.length - 1] === 0) {
      result.pop();
    }

    // -dev < -rc1 < -rc2 < (final release)
    if (flag === undefined) {
      result.push(-1);
    } else if (Array.isArray(flag) && flag[0] === 'rc') {
      result.push(-2);
      result.push(flag[1]);
    } else if (flag === 'dev') {
      result.push(-3);
    }

    // Break ties with numCommits.
    if (numCommits !== undefined) {
      result.push(numCommits);
    }

    return result;
  };
}
