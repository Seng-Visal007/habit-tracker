import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * OfflineBanner — driven purely by the browser's online/offline events.
 *
 * Design decisions:
 * - Uses window.navigator.onLine as initial state (avoids flash on load)
 * - Listens to 'online'/'offline' events which fire reliably on all modern browsers
 * - Shows a "back online" confirmation for 3 seconds before disappearing
 * - Does NOT rely on fetch probing (keeps it simple & no false positives from CORS)
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showOnlineConfirm, setShowOnlineConfirm] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineConfirm(true);
      const timer = setTimeout(() => setShowOnlineConfirm(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineConfirm(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Nothing to show when online and confirmation period has ended
  if (isOnline && !showOnlineConfirm) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className="fixed top-0 left-0 right-0 z-[9998] flex justify-center"
    >
      {!isOnline ? (
        // Offline banner — persistent, amber/orange
        <div className="flex w-full items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold text-amber-950 shadow-md">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>You&rsquo;re offline — habits added now will sync when reconnected</span>
        </div>
      ) : (
        // Back online confirmation — green, auto-dismisses
        <div className="flex w-full items-center justify-center gap-2 bg-green-500 px-4 py-2 text-xs font-semibold text-green-950 shadow-md animate-in slide-in-from-top duration-300">
          <Wifi className="h-3.5 w-3.5 shrink-0" />
          <span>Back online — syncing your habits…</span>
        </div>
      )}
    </div>
  );
}
