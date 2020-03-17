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
 * * to report it to Sentry: use .raw for its raw form, and .loggingArray
 *   for a form handy for event aggregation.
 *
 * The ZulipVersion instance itself cannot be persisted in ZulipAsyncStorage or
 * sent to Sentry because it isn't serializable. Instead, persist the raw
 * version string.
 */
export class ZulipVersion {
  _raw: string;
  _comparisonArray: number[];
  _loggingArray: number[];

  constructor(raw: string) {
    this._raw = raw;
    this._comparisonArray = this._getComparisonArray(raw);
    this._loggingArray = this._getLoggingArray(raw);
  }

  /**
   * The raw version string that was passed to the constructor.
   */
  raw = () => this._raw;

  /**
   * Data to be sent to Sentry to help with event aggregation.
   *
   * A [major, minor, patch] array where missing values
   * are replaced with zero; everything beyond major, minor, patch
   * is ignored.
   */
  loggingArray = () => this._loggingArray;

  /**
   * True if this version is later than or equal to a given threshold.
   */
  isAtLeast = (otherZulipVersion: ZulipVersion) => {
    const otherComparisonArray = otherZulipVersion._comparisonArray;
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
   * Parse the raw string into a VersionElements for _getComparisonArray.
   */
  _getElements = (raw: string): VersionElements => {
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
  _getComparisonArray = (raw: string): number[] => {
    const { major, minor, patch, flag, numCommits } = this._getElements(raw);
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

  _getLoggingArray = (raw: string): number[] => {
    const { major, minor, patch } = this._getElements(raw);
    return [major, minor, patch].map(e => (e !== undefined ? e : 0));
  };
}
