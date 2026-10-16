import { useEffect, useState } from 'react';

/** Fast remote reads should not flash a loader. */
export const REMOTE_LOADING_DELAY_MS = 250;

/** One loading signal follows remote content from the empty viewport into the
 * title. Cached messages stay readable until fresh content has actually arrived.
 * Connection banners take precedence; local tasks never show this indicator. */
export function useRemoteSessionLoading({
  sessionId,
  remoteDeviceId,
  historyLoaded,
  contentSyncing,
  hasMessages,
  connectionNotice,
}: {
  sessionId: string | undefined;
  remoteDeviceId: string | undefined;
  historyLoaded: boolean;
  contentSyncing: boolean;
  hasMessages: boolean;
  connectionNotice: boolean;
}): 'hidden' | 'loading' | 'syncing' {
  const active =
    !!sessionId && !!remoteDeviceId && !connectionNotice && (!historyLoaded || contentSyncing);
  const [revealed, setRevealed] = useState<{ sessionId: string; deviceId: string } | null>(null);

  useEffect(() => {
    setRevealed(null);
    if (!active || !sessionId || !remoteDeviceId) return;
    const timer = setTimeout(() => {
      setRevealed({ sessionId, deviceId: remoteDeviceId });
    }, REMOTE_LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [active, sessionId, remoteDeviceId]);

  // The store explicitly invalidated history while retaining messages: the
  // displayed content needs refreshing, so show feedback immediately.
  const immediate = hasMessages && !historyLoaded;
  const delayElapsed = revealed?.sessionId === sessionId && revealed?.deviceId === remoteDeviceId;
  if (!active || (!immediate && !delayElapsed)) return 'hidden';
  return hasMessages ? 'syncing' : 'loading';
}
