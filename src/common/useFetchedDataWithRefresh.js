/* @flow strict-local */
import { useState, useCallback, useRef } from 'react';

import { useConditionalEffect, useDebugAssertConstant, useHasStayedTrueForMs } from '../reactUtils';
import { tryFetch } from '../message/fetchActions';

type SuccessResult<TData> = {| +type: 'success', +data: TData |};
type FailResult = {| +type: 'error', +error: mixed |};
type Result<TData> = SuccessResult<TData> | FailResult;

/**
 * Fetch and refresh data outside the event system, to show in the UI.
 *
 * Some data, like read receipts, isn't provided via the event system and
 * must be fetched with an API call. Use this Hook to maintain an
 * automatically refreshed shapshot of the data in a React component.
 *
 * The returned `latestResult` and `latestSuccessResult` will be unique per
 * request and will be === when the latest result was successful.
 *
 * Of course, any API call can fail or take longer than expected. Callers
 * should use this Hook's output to inform the user when this is the case.
 * For example:
 *
 *   const { latestResult, latestSuccessResult } = useFetchedDataWithRefresh(…);
 *   const latestResultIsError = latestResult?.type === 'error';
 *   const isFirstLoadLate = useHasStayedTrueForMs(latestSuccessResult === null, 10_000);
 *   const haveStaleData =
 *     useHasNotChangedForMs(latestSuccessResult, 40_000) && latestSuccessResult !== null;
 *
 * Still, this Hook handles its own retry logic and will do its best to
 * fetch and show the data for as long as the calling React component is
 * mounted.
 *
 * @param {callApiMethod} - E.g., a function that returns the Promise from
 *   api.getReadReceipts(…), to fetch read receipts.
 * @param {refreshIntervalMs} - How long to wait after the latest response
 *   (success or failure) before requesting again.
 */
export default function useFetchedDataWithRefresh<TData>(
  callApiMethod: () => Promise<TData>,
  refreshIntervalMs: number,
): {|
  +latestResult: null | Result<TData>,
  +latestSuccessResult: null | SuccessResult<TData>,
|} {
  useDebugAssertConstant(refreshIntervalMs);

  const [isFetching, setIsFetching] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [latestSuccessResult, setLatestSuccessResult] = useState(null);

  const fetch = useCallback(async () => {
    setIsFetching(true);
    try {
      const data: TData = await tryFetch(callApiMethod);
      const result = { type: 'success', data };
      setLatestResult(result);
      setLatestSuccessResult(result);
    } catch (errorIllTyped) {
      const error: mixed = errorIllTyped; // https://github.com/facebook/flow/issues/2470
      const result = { type: 'error', error };
      setLatestResult(result);
    } finally {
      setIsFetching(false);
    }
  }, [callApiMethod]);

  const startFetchIfNotFetching = useCallback(() => {
    if (isFetching) {
      return;
    }

    fetch();
  }, [isFetching, fetch]);

  const isFirstCall = useRef(true);
  const shouldRefresh =
    useHasStayedTrueForMs(!isFetching, refreshIntervalMs) || isFirstCall.current;
  isFirstCall.current = false;

  useConditionalEffect(startFetchIfNotFetching, shouldRefresh);

  return {
    latestResult,
    latestSuccessResult,
  };
}
